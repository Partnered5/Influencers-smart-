import { ENV } from "./env";
import { storagePut } from "../storage";

export const UGC_OBJECTIVES = [
  "Reach 5M+ weekly views",
  "Create a $500 digital product",
  "Sell 6+ products daily",
  "Publish a proof-led case study",
  "Close a qualified lead",
  "Pitch a $5,000 sponsorship",
  "Run a faceless system in under one hour",
] as const;

export type UGCVideoOptions = {
  prompt: string;
  script: string;
  objective: (typeof UGC_OBJECTIVES)[number];
  aspectRatio: "portrait" | "landscape";
  durationSeconds: number;
  referenceImageUrl?: string;
  voiceover: boolean;
};

export type UGCVideoResponse = {
  url?: string;
  key?: string;
  provider: string;
  externalJobId?: string;
};

export function buildSafeUGCPrompt(input: UGCVideoOptions) {
  return [
    "Create a short-form UGC marketing video using a fictional adult creator or a faceless product-demo style.",
    `Objective: ${input.objective}.`,
    `Creative brief: ${input.prompt}.`,
    `Spoken script and on-screen copy: ${input.script}.`,
    "Use natural handheld movement, a strong first-second hook, readable captions, authentic product use, and a clear call to action.",
    "Do not imitate a real person, use a minor, make medical or financial guarantees, or imply undisclosed sponsorship.",
    "Include a visible AI-generated disclosure in the final frame.",
  ].join(" ");
}

function getProviderConfig() {
  if (!ENV.videoProviderUrl || !ENV.videoProviderKey) {
    throw new Error("UGC video generation is not configured. Set UGC_VIDEO_PROVIDER_URL and UGC_VIDEO_PROVIDER_KEY on the server.");
  }
  return { url: ENV.videoProviderUrl.replace(/\/+$/, ""), key: ENV.videoProviderKey };
}

export async function generateUGCVideo(options: UGCVideoOptions): Promise<UGCVideoResponse> {
  const provider = getProviderConfig();
  const response = await fetch(provider.url, {
    method: "POST",
    headers: { accept: "application/json", "content-type": "application/json", authorization: `Bearer ${provider.key}` },
    body: JSON.stringify({
      prompt: buildSafeUGCPrompt(options),
      aspect_ratio: options.aspectRatio,
      duration_seconds: options.durationSeconds,
      generate_audio: options.voiceover,
      ...(options.referenceImageUrl ? { reference_image_url: options.referenceImageUrl } : {}),
    }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`UGC video provider request failed (${response.status})${detail ? `: ${detail}` : ""}`);
  }
  const result = (await response.json()) as { video?: { b64Json?: string; mimeType?: string; url?: string }; url?: string; id?: string; job_id?: string };
  const inline = result.video?.b64Json;
  if (inline) {
    const stored = await storagePut(`generated/ugc-${Date.now()}.mp4`, Buffer.from(inline, "base64"), result.video?.mimeType ?? "video/mp4");
    return { url: stored.url, key: stored.key, provider: "configured", externalJobId: result.id ?? result.job_id };
  }
  return { url: result.video?.url ?? result.url, provider: "configured", externalJobId: result.id ?? result.job_id };
}

export function hasUGCVideoProvider() {
  return Boolean(ENV.videoProviderUrl && ENV.videoProviderKey);
}
