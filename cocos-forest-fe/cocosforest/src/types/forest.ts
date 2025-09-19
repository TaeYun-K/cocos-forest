export type Cell = {
  x: number;
  z: number;
  sx: number;
  sy: number;
  path: string;
};
export type Marker = { x: number; z: number; sx: number; sy: number };
export type Layout = { w: number; h: number };

// 서버에서 받아오는 좌표
export type MarkerCoord = { x: number; z: number };
