// api/forest.ts
import apiClient, { mock } from "./axios";
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

// 개발환경 mock
if (__DEV__ && mock) {
  mock.onGet("/stats").reply(200, { points: 12345, growth: 73 });
  mock.onGet("/markers").reply(200, {
    markers: [
      { x: 2, z: 3 },
      { x: 5, z: 6 },
      { x: 1, z: 4 },
    ],
  });
}
