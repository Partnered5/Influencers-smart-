import { describe, expect, it } from "vitest";
import { buildSafeAvatarPrompt, disclosureStamp } from "./routers";

describe("avatar generation safety contract", () => {
  it("preserves the creator anchor when identity lock is enabled", () => {
    const prompt = buildSafeAvatarPrompt({ creatorName: "Aria Vale", visualAnchor: "olive skin, dark wavy hair, hazel eyes", prompt: "show a morning ritual", seed: 1842, pose: "Seated product demo", wardrobe: "Cobalt blazer", identityLock: true });
    expect(prompt).toContain("Preserve the stable visual identity of Aria Vale");
    expect(prompt).toContain("Seed reference: 1842");
    expect(prompt).toContain("Avoid real-person likeness, minors, nudity, or sexualized framing.");
  });

  it("uses a fresh fictional identity instruction when identity lock is disabled", () => {
    const prompt = buildSafeAvatarPrompt({ creatorName: "Aria Vale", visualAnchor: "anchor", prompt: "new launch", seed: 4, pose: "Walking candid", wardrobe: "Cream knit", identityLock: false });
    expect(prompt).toContain("Create a new fictional adult virtual creator identity.");
  });

  it("keeps the disclosure stamp explicit and brand-scoped", () => {
    expect(disclosureStamp).toBe("AI-generated virtual creator · Influencer Smart");
  });
});
