import { useMemo } from "react";
import { Cell, Marker, MarkerCoord } from "../types/forest";
import { toScreen, getTopFaceVertices, buildPath } from "../utils/iso";
import { GRID } from "../utils/iso";

export function useCells(centerX: number, topMargin: number) {
  return useMemo<Cell[]>(() => {
    const arr: Cell[] = [];
    for (let z = 0; z < GRID; z++) {
      for (let x = 0; x < GRID; x++) {
        const { sx, sy } = toScreen(x, z, centerX, topMargin);
        const path = buildPath(getTopFaceVertices(sx, sy));
        arr.push({ x, z, sx, sy, path });
      }
    }
    arr.sort((a, b) => a.x + a.z - (b.x + b.z));
    return arr;
  }, [centerX, topMargin]);
}

export function projectMarkers(
  coords: MarkerCoord[],
  centerX: number,
  topMargin: number
) {
  return coords.map<Marker>((coord) => {
    const { sx, sy } = toScreen(coord.x, coord.z, centerX, topMargin);
    return { ...coord, sx, sy };  // 모든 기존 속성 유지하면서 sx, sy만 추가
  });
}

export function useMarkerSet(markers: Marker[]) {
  return useMemo(() => new Set(markers.map((m) => `${m.x},${m.z}`)), [markers]);
}
