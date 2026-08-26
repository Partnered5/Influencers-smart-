import { readFile } from "node:fs/promises";
import { storageGetSignedUrl, storagePut } from "../server/storage.ts";
import { generateImage } from "../server/_core/imageGeneration.ts";

const source = "/home/ubuntu/webdev-static-assets/influencer-smart-avatar-editorial.png";
const buffer = await readFile(source);
const uploaded = await storagePut(`smoke/reference-${Date.now()}.png`, buffer, "image/png");
const signedUrl = await storageGetSignedUrl(uploaded.key);
if (!/^https?:\/\//i.test(signedUrl)) throw new Error(`Expected signed HTTPS URL, received ${signedUrl}`);
const result = await generateImage({
  prompt: "Create a realistic fictional adult virtual fashion creator image using the reference for visual continuity, cobalt blazer, warm editorial studio, three-quarter portrait, fully covered, tasteful commercial campaign photography.",
  quality: "medium",
  originalImages: [{ url: signedUrl, mimeType: "image/png" }],
});
if (!result.url || !result.key) throw new Error("Reference-guided generation returned no stored asset");
console.log(JSON.stringify({ ok: true, referenceKey: uploaded.key, generatedKey: result.key, generatedUrl: result.url }));
