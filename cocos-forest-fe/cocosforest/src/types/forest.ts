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

// 백엔드 실제 응답 구조에 맞게 수정
export type ForestInfoDto = {
  aliveTreeCount: number;
  createdAt: string;
  deadHighlightCount: number;
  forestId: number;
  pondX: number;
  pondY: number;
  size: number;
  trees: Array<{
    deadHighlight: boolean;
    growthDays: number;
    growthStage: string;
    health: number;
    isDead: boolean;
    lastWateredDate: string | null;
    maxHealth: number;
    plantedAt: string;
    treeId: number;
    waterCountToday: number;
    x: number;
    y: number;
  }>;
  updatedAt: string;
  userId: number;
};