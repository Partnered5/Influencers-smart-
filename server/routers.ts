import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { generateImage } from "./_core/imageGeneration";
import { storagePut } from "./storage";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { createAvatarProfile, createContentItem, createWorkspace, getWorkspaceForUser, listContentItems, listWorkspaces, updateAvatarProfile } from "./db";

const workspaceInput = z.object({
  name: z.string().min(1).max(120),
  creatorName: z.string().min(1).max(120),
  creatorBio: z.string().min(1),
  persona: z.string().min(1),
  voice: z.string().min(1),
  visualAnchor: z.string().min(1),
  disclosureEnabled: z.boolean().default(true),
});

const avatarInput = z.object({
  workspaceId: z.number().int().positive(),
  prompt: z.string().min(10).max(4000),
  seed: z.number().int().min(0).max(2147483647),
  pose: z.string().min(1).max(80),
  wardrobe: z.string().min(1).max(120),
  setting: z.string().min(1).max(100),
  composition: z.string().min(1).max(100),
  identityLock: z.boolean().default(true),
  ageConfirmed: z.literal(true),
  referenceImage: z.object({ b64Json: z.string().min(100), mimeType: z.string().regex(/^image\/(png|jpeg|webp)$/), fileName: z.string().max(160) }).optional(),
});

export function buildSafeAvatarPrompt(input: { creatorName: string; visualAnchor: string; prompt: string; seed: number; pose: string; wardrobe: string; setting: string; composition: string; identityLock: boolean }) {
  const identityInstruction = input.identityLock ? `Preserve the stable visual identity of ${input.creatorName}: ${input.visualAnchor}.` : "Create a new fictional adult virtual creator identity.";
  return `Create a fictional adult virtual creator image for a disclosed marketing campaign. ${identityInstruction} Pose: ${input.pose}. Wardrobe: ${input.wardrobe}. Setting: ${input.setting}. Composition and framing: ${input.composition}. Creative brief: ${input.prompt}. Seed reference: ${input.seed}. The person must be clearly fictional, adult, tasteful, and non-explicit. Avoid real-person likeness, minors, nudity, or sexualized framing.`;
}

export const disclosureStamp = "AI-generated virtual creator · Influencer Smart";

const exportInput = z.object({
  workspaceId: z.number().int().positive(),
  avatarProfileId: z.number().int().positive().optional(),
  title: z.string().min(1).max(180),
  channel: z.enum(["Instagram", "TikTok", "Product ad"]),
  format: z.enum(["Carousel", "Reel", "Story", "Square ad", "Vertical ad"]),
  caption: z.string().min(1),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  workspace: router({
    list: protectedProcedure.query(({ ctx }) => listWorkspaces(ctx.user.id)),
    create: protectedProcedure.input(workspaceInput).mutation(({ ctx, input }) => createWorkspace({ ...input, userId: ctx.user.id, disclosureEnabled: input.disclosureEnabled ? 1 : 0 })),
    get: protectedProcedure.input(z.object({ id: z.number().int().positive() })).query(({ ctx, input }) => getWorkspaceForUser(input.id, ctx.user.id)),
  }),
  content: router({
    list: protectedProcedure.input(z.object({ workspaceId: z.number().int().positive() })).query(({ input }) => listContentItems(input.workspaceId)),
    createExport: protectedProcedure.input(exportInput).mutation(async ({ ctx, input }) => {
      const workspace = await getWorkspaceForUser(input.workspaceId, ctx.user.id);
      if (!workspace) throw new Error("Workspace not found");
      const id = await createContentItem({ workspaceId: input.workspaceId, avatarProfileId: input.avatarProfileId, title: input.title, kind: "export", channel: input.channel, format: input.format, body: `${input.caption}\n\n${disclosureStamp}`, disclosureStamp, status: "exported" });
      return { id, title: input.title, channel: input.channel, format: input.format, disclosureStamp };
    }),
  }),
  avatar: router({
    generate: protectedProcedure.input(avatarInput).mutation(async ({ ctx, input }) => {
      const workspace = await getWorkspaceForUser(input.workspaceId, ctx.user.id);
      if (!workspace) throw new Error("Workspace not found");
      let referenceImageKey: string | undefined;
      let referenceImageUrl: string | undefined;
      if (input.referenceImage) {
        const referenceBuffer = Buffer.from(input.referenceImage.b64Json, "base64");
        const storedReference = await storagePut(`references/${ctx.user.id}/${input.referenceImage.fileName}`, referenceBuffer, input.referenceImage.mimeType);
        referenceImageKey = storedReference.key;
        referenceImageUrl = storedReference.url;
      }
      const profileId = await createAvatarProfile({ workspaceId: input.workspaceId, prompt: input.prompt, seed: input.seed, pose: input.pose, wardrobe: input.wardrobe, identityLock: input.identityLock ? 1 : 0, ageConfirmed: 1, referenceImageKey, referenceImageUrl, status: "generating" });
      const safePrompt = buildSafeAvatarPrompt({ creatorName: workspace.creatorName, visualAnchor: workspace.visualAnchor, prompt: input.prompt, seed: input.seed, pose: input.pose, wardrobe: input.wardrobe, setting: input.setting, composition: input.composition, identityLock: input.identityLock });
      try {
        const result = await generateImage({ prompt: safePrompt, quality: "medium", originalImages: referenceImageUrl ? [{ url: referenceImageUrl, mimeType: input.referenceImage?.mimeType }] : undefined });
        await updateAvatarProfile(profileId, { imageKey: result.key, imageUrl: result.url, status: "ready" });
        const contentId = await createContentItem({ workspaceId: input.workspaceId, avatarProfileId: profileId, title: `${workspace.creatorName} · ${input.pose}`, kind: "image", channel: "Studio", format: "Portrait", body: input.prompt, assetKey: result.key, assetUrl: result.url, disclosureStamp: "AI-generated virtual creator · Influencer Smart", status: "ready" });
        return { profileId, contentId, imageUrl: result.url, disclosureStamp: "AI-generated virtual creator · Influencer Smart" };
      } catch (error) {
        await updateAvatarProfile(profileId, { status: "failed" });
        throw error;
      }
    }),
  }),
});

export type AppRouter = typeof appRouter;
