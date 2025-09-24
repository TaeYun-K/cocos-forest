// Sprite registry for local-bundled images in React Native (Metro requires static requires)

const SPRITES: Record<string, any> = {
  // flowers
  "home/decorations/flower/flowersdark.png": require("../../assets/home/decorations/flower/flowersdark.png"),
  "home/decorations/flower/poppy.png": require("../../assets/home/decorations/flower/poppy.png"),
  "home/decorations/flower/tulips.png": require("../../assets/home/decorations/flower/tulips.png"),
  "home/decorations/flower/tulipsdark.png": require("../../assets/home/decorations/flower/tulipsdark.png"),

  // obstacles / etc
  "home/decorations/obstacle/barrel.png": require("../../assets/home/decorations/obstacle/barrel.png"),
  "home/decorations/obstacle/chestdarkopenr.png": require("../../assets/home/decorations/obstacle/chestdarkopenr.png"),
  "home/decorations/torch/stonetorchr.png": require("../../assets/home/decorations/torch/stonetorchr.png"),
  "home/decorations/obstacle/stonebrickdark.png": require("../../assets/home/decorations/obstacle/stonebrickdark.png"),
  "home/decorations/obstacle/stonebrickdarkfull.png": require("../../assets/home/decorations/obstacle/stonebrickdarkfull.png"),

  // trees
  "home/decorations/tree/blossom_tree.png": require("../../assets/home/decorations/tree/blossom_tree.png"),
  "home/decorations/tree/medium_tree.png": require("../../assets/home/decorations/tree/medium_tree.png"),
  "home/decorations/tree/orange_tree.png": require("../../assets/home/decorations/tree/orange_tree.png"),
  "home/decorations/tree/small_tree.png": require("../../assets/home/decorations/tree/small_tree.png"),
  "home/decorations/tree/tree.png": require("../../assets/home/decorations/tree/tree.png"),
};

// Some DB rows might omit subfolders (e.g., home/decorations/poppy.png)
// Try known directories as fallback.
const FALLBACK_DIRS = [
  "home/decorations/flower/",
  "home/decorations/tree/",
  "home/decorations/obstacle/",
  "home/decorations/torch/",
];

export function getSpriteByKey(spriteKey?: string) {
  if (!spriteKey) return undefined;
  if (SPRITES[spriteKey]) return SPRITES[spriteKey];
  const base = spriteKey.split('/').pop();
  if (!base) return undefined;
  for (const dir of FALLBACK_DIRS) {
    const candidate = dir + base;
    if (SPRITES[candidate]) return SPRITES[candidate];
  }
  return undefined;
}

export default SPRITES;
