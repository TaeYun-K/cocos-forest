// api/forest.ts
import apiClient from "./axios";
import type { MarkerCoord } from "../types/forest";

export type StatsDto = { points: number; growth: number };
export type MarkersDto = { markers: MarkerCoord[] };

export async function fetchStats(): Promise<StatsDto> {
  const res = await apiClient.get("/stats");
  return res.data;
}

export async function fetchMarkers(): Promise<MarkersDto> {
  const res = await apiClient.get("/markers");
  return res.data;
}

// Mock 제거 - 실제 백엔드 API 호출
