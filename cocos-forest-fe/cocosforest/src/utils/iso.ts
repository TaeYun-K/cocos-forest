// iso.ts
export const SPRITE_W = 64;
export const FOOT_H = 32;
export const WALL_H = 32;
export const TOP_FACE_H = 32;

export const MARKER_SIZE = 64;

export function toScreen(
  x: number,
  z: number,
  centerX: number,
  topMargin: number
) {
  const sx = (x - z) * (SPRITE_W / 2) + centerX;
  const sy = (x + z) * (FOOT_H / 2) + topMargin;
  return { sx, sy };
}

export function getTopFaceVertices(sx: number, sy: number) {
  const halfW = SPRITE_W / 2;
  const halfH = TOP_FACE_H / 2;
  const topFaceCenterY = sy - FOOT_H / 2 - WALL_H + halfH;

  const top: [number, number] = [sx, topFaceCenterY - halfH];
  const right: [number, number] = [sx + halfW, topFaceCenterY];
  const bottom: [number, number] = [sx, topFaceCenterY + halfH];
  const left: [number, number] = [sx - halfW, topFaceCenterY];

  return [top, right, bottom, left] as const;
}

export function buildPath(verts: ReadonlyArray<Readonly<[number, number]>>) {
  return `M${verts[0][0]} ${verts[0][1]} L${verts[1][0]} ${verts[1][1]} L${verts[2][0]} ${verts[2][1]} L${verts[3][0]} ${verts[3][1]} Z`;
}

export function computeBoardHeight(forestSize: number = 8) {
  return (forestSize - 1 + forestSize - 1) * (FOOT_H / 2) + FOOT_H + WALL_H;
}

export function computeBoardWidth(forestSize: number = 8) {
  return (forestSize - 1 + forestSize - 1) * (SPRITE_W / 2) + SPRITE_W;
}

export function computeTopMargin(containerH: number, forestSize: number = 8) {
  const boardHeight = computeBoardHeight(forestSize);
  return Math.max(12, (containerH - boardHeight) / 2);
}
