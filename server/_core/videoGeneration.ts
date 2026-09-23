import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ENV } from "./env";
import { generateImage } from "./imageGeneration";
import { storageGetSignedUrl, storagePut } from "../storage";

const execFileAsync = promisify(execFile);

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
  provider: "internal-local" | "configured";
  externalJobId?: string;
};

export function buildSafeUGCPrompt(input: UGCVideoOptions) {
  return [
    "Create a highly photorealistic, camera-ready still frame for a premium short-form UGC marketing or product-launch video using a fictional adult creator or a faceless product-demo style.",
    `Objective: ${input.objective}.`,
    `Creative brief: ${input.prompt}.`,
    `Spoken script and on-screen copy: ${input.script}.`,
    "Use realistic human anatomy, natural skin texture, believable hands, accurate eyes, subtle expression, authentic handheld smartphone composition, soft daylight, lens depth, a strong first-second hook, readable caption space, authentic product use, and a clear call to action.",
    "Make it suitable for a polished brand launch, testimonial, product demo, creator ad, or faceless explainer rather than a synthetic avatar showcase.",
    "Do not imitate a real person, use a minor, make medical or financial guarantees, or imply undisclosed sponsorship.",
    "Leave clean lower-third space for the visible AI-generated disclosure; do not render any other text or logos into the image.",
  ].join(" ");
}

function getExternalProviderConfig() {
  if (!ENV.videoProviderUrl || !ENV.videoProviderKey) return null;
  return { url: ENV.videoProviderUrl.replace(/\/+$/, ""), key: ENV.videoProviderKey };
}

async function generateWithConfiguredProvider(options: UGCVideoOptions, provider: { url: string; key: string }): Promise<UGCVideoResponse> {
  const response = await fetch(provider.url, {
    method: "POST",
    headers: { accept: "application/json", "content-type": "application/json", authorization: `Bearer ${provider.key}` },
    body: JSON.stringify({ prompt: buildSafeUGCPrompt(options), aspect_ratio: options.aspectRatio, duration_seconds: options.durationSeconds, generate_audio: options.voiceover, ...(options.referenceImageUrl ? { reference_image_url: options.referenceImageUrl } : {}) }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`UGC video provider request failed (${response.status})${detail ? `: ${detail}` : ""}`);
  }
  const result = (await response.json()) as { video?: { b64Json?: string; mimeType?: string; url?: string }; url?: string; id?: string; job_id?: string };
  if (result.video?.b64Json) {
    const stored = await storagePut(`generated/ugc-${Date.now()}.mp4`, Buffer.from(result.video.b64Json, "base64"), result.video.mimeType ?? "video/mp4");
    return { url: stored.url, key: stored.key, provider: "configured", externalJobId: result.id ?? result.job_id };
  }
  return { url: result.video?.url ?? result.url, provider: "configured", externalJobId: result.id ?? result.job_id };
}

async function generateInternalLocalVideo(options: UGCVideoOptions): Promise<UGCVideoResponse> {
  const still = await generateImage({ prompt: buildSafeUGCPrompt(options), model: "MODEL_GPT_IMAGE_2", quality: "medium" });
  if (!still.key) throw new Error("Internal image generation returned no storage key");
  const workDir = await mkdtemp(join(tmpdir(), "influencer-smart-"));
  const inputPath = join(workDir, "creator-still.png");
  const outputPath = join(workDir, "ugc-video.mp4");
  try {
    const signedUrl = await storageGetSignedUrl(still.key);
    const imageResponse = await fetch(signedUrl);
    if (!imageResponse.ok) throw new Error(`Internal image download failed (${imageResponse.status})`);
    await writeFile(inputPath, Buffer.from(await imageResponse.arrayBuffer()));
    const width = options.aspectRatio === "portrait" ? 720 : 1280;
    const height = options.aspectRatio === "portrait" ? 1280 : 720;
    const duration = Math.max(5, Math.min(60, options.durationSeconds));
    const filter = `scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height},eq=contrast=1.04:saturation=1.06:brightness=0.01,zoompan=z='min(zoom+0.00065,1.06)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${duration * 25}:s=${width}x${height}:fps=25,vignette=PI/5,drawtext=text='AI-GENERATED VIRTUAL CREATOR':fontcolor=white:fontsize=${options.aspectRatio === "portrait" ? 24 : 30}:box=1:boxcolor=black@0.55:boxborderw=10:x=(w-text_w)/2:y=h-100`;
    await execFileAsync("ffmpeg", ["-y", "-loop", "1", "-i", inputPath, "-vf", filter, "-t", String(duration), "-an", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-movflags", "+faststart", outputPath]);
    const buffer = await readFile(outputPath);
    const stored = await storagePut(`generated/ugc-local-${Date.now()}.mp4`, buffer, "video/mp4");
    return { url: stored.url, key: stored.key, provider: "internal-local" };
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}

export async function generateUGCVideo(options: UGCVideoOptions): Promise<UGCVideoResponse> {
  const external = getExternalProviderConfig();
  return external ? generateWithConfiguredProvider(options, external) : generateInternalLocalVideo(options);
}

export function hasUGCVideoProvider() {
  return true;
}
