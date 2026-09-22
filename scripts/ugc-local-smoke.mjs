import { generateUGCVideo } from "../server/_core/videoGeneration.ts";

const result = await generateUGCVideo({
  objective: "Reach 5M+ weekly views",
  prompt: "A fictional adult male AI creator demonstrates a simple morning product ritual in a bright apartment kitchen with authentic handheld UGC energy.",
  script: "Hook: I did not expect this to change my morning. Show the product, one specific benefit, and a clear call to action.",
  aspectRatio: "portrait",
  durationSeconds: 5,
  voiceover: false,
});
console.log(JSON.stringify(result, null, 2));
