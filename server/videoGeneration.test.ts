import { describe, expect, it } from "vitest";
import { buildSafeUGCPrompt, UGC_OBJECTIVES } from "./_core/videoGeneration";

describe("UGC video generation safety contract", () => {
  it("exposes all seven campaign objectives", () => {
    expect(UGC_OBJECTIVES).toHaveLength(7);
    expect(UGC_OBJECTIVES[0]).toContain("5M");
    expect(UGC_OBJECTIVES[6]).toContain("faceless");
  });

  it("builds a fictional, disclosed, non-deceptive video prompt", () => {
    const prompt = buildSafeUGCPrompt({
      objective: UGC_OBJECTIVES[5],
      prompt: "A creator opens a sponsorship brief and explains the audience fit.",
      script: "Hook: here is the audience insight brands keep asking for.",
      aspectRatio: "portrait",
      durationSeconds: 15,
      voiceover: true,
    });
    expect(prompt).toContain("fictional adult creator");
    expect(prompt).toContain("visible AI-generated disclosure");
    expect(prompt).toContain("Do not imitate a real person");
  });
});
