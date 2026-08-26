import { describe, expect, it } from "vitest";
import { buildSafeAvatarPrompt, disclosureStamp, resolveProviderImageUrl } from "./routers";

describe("avatar generation safety contract", () => {
  it("preserves the creator anchor when identity lock is enabled", () => {
    const prompt = buildSafeAvatarPrompt({ creatorName: "Aria Vale", visualAnchor: "olive skin, dark wavy hair, hazel eyes", prompt: "show a morning ritual", seed: 1842, pose: "Seated product demo", wardrobe: "Cobalt blazer", setting: "Warm coastal beach", composition: "Full-body lookbook", identityLock: true });
    expect(prompt).toContain("Preserve the stable visual identity of Aria Vale");
    expect(prompt).toContain("Seed reference: 1842");
    expect(prompt).toContain("Avoid real-person likeness, minors, nudity, or sexualized framing.");
  });

  it("uses a fresh fictional identity instruction when identity lock is disabled", () => {
    const prompt = buildSafeAvatarPrompt({ creatorName: "Aria Vale", visualAnchor: "anchor", prompt: "new launch", seed: 4, pose: "Walking candid", wardrobe: "Cream knit", setting: "Editorial studio", composition: "Three-quarter portrait", identityLock: false });
    expect(prompt).toContain("Create a new fictional adult virtual creator identity.");
  });

  it("includes explicit setting and composition in the safe prompt", () => {
    const prompt = buildSafeAvatarPrompt({ creatorName: "Aria Vale", visualAnchor: "anchor", prompt: "product launch", seed: 9, pose: "Full-body lookbook", wardrobe: "Linen set", setting: "Warm coastal beach", composition: "Product-in-hand medium shot", identityLock: true });
    expect(prompt).toContain("Setting: Warm coastal beach");
    expect(prompt).toContain("Composition and framing: Product-in-hand medium shot");
  });

  it("accepts only provider-safe HTTPS reference URLs", () => {
    expect(resolveProviderImageUrl("https://cdn.example.com/reference.jpg")).toBe("https://cdn.example.com/reference.jpg");
    expect(() => resolveProviderImageUrl("/manus-storage/references/sample.jpg")).toThrow("Reference image could not be prepared");
  });

  it("keeps the disclosure stamp explicit and brand-scoped", () => {
    expect(disclosureStamp).toBe("AI-generated virtual creator · Influencer Smart");
  });
});
