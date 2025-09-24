//Forest.tsx
import React, { useMemo } from "react";
import { View, Image, StyleSheet, Alert, TouchableOpacity } from "react-native";
import Svg, { Path } from "react-native-svg";
import { homeStyles as s } from "../../styles/homeStyles";
import {
  SPRITE_W,
  FOOT_H,
  WALL_H,
  TOP_FACE_H,
  MARKER_SIZE,
  getTopFaceVertices,
  buildPath,
} from "../../utils/iso";
import type { Cell, Marker } from "../../types/forest";
import type { ForestInfoDto } from "../../types/forest";
import { getSpriteByKey } from "../../assets/spriteMap";

const GRASS_DARK = require("../../../assets/home/tiles/grassdark.png");
const GRASS_WEEDS = require("../../../assets/home/tiles/grassweeds.png");
const DIRT_PLAIN_IMG = require("../../../assets/home/tiles/dirt.png");
const GRASS_IMG = require("../../../assets/home/tiles/grass.png");
const WATER_IMG = require("../../../assets/home/tiles/water.png");
const MARKER_IMG = require("../../../assets/home/decorations/tree/medium_tree.png");

const SMALL_TREE_IMG = require("../../../assets/home/decorations/tree/small_tree.png");
const MEDIUM_TREE_IMG = require("../../../assets/home/decorations/tree/medium_tree.png");
const LARGE_TREE_IMG = require("../../../assets/home/decorations/tree/medium_tree.png");

// dead tree asset
const DEAD_TREE_WARNING_IMG = require("../../../assets/home/tiles/alert.png");

// mapping by assetId not needed; use spriteKey from API assets

// 나무 상태에 따른 에셋 선택 함수
const getTreeAsset = (growthStage?: string, isDead?: boolean, health?: number, maxHealth?: number) => {
  // 죽은 나무인 경우 (health가 0이거나 isDead가 true)
  if (isDead || (health !== undefined && health <= 0)) {
    return DEAD_TREE_WARNING_IMG; // 죽은 나무는 경고 표시
  }
  
  // 체력이 매우 낮은 경우 (30% 이하) - 시들어가는 나무 에셋 (없으면 기본 에셋)
  if (health !== undefined && maxHealth !== undefined) {
    const healthPercentage = (health / maxHealth) * 100;
    if (healthPercentage <= 30) {
      // 추후 시들어가는 나무 에셋 추가 시 사용
      // return WITHERING_TREE_IMG;
    }
  }
  
  // 살아있는 나무의 성장 단계별 에셋
  switch (growthStage) {
    case 'SMALL':
      return SMALL_TREE_IMG;
    case 'MEDIUM':
      return MEDIUM_TREE_IMG;
    case 'LARGE':
      return LARGE_TREE_IMG;
    default:
      return MARKER_IMG;
  }
};

type Props = {
  cells: Cell[];
  markers: Marker[];
  layoutW: number;
  layoutH?: number;
  zoom?: number;
  panX?: number;
  panY?: number;
  onCellPress: (cell: Cell) => void;
  selectedCell?: Cell | null;
  forestInfo?: ForestInfoDto;
  onDeadTreePress: (treeId: number) => void;
  onExpandableAreaPress: () => void; // 확장 가능 영역 클릭 핸들러 추가
};

export default function Board({
  cells,
  markers,
  layoutW,
  layoutH,
  zoom = 1,
  panX = 0,
  panY = 0,
  onCellPress,
  selectedCell,
  forestInfo,
  onDeadTreePress,
  onExpandableAreaPress,
}: Props) {
  const forestSize = forestInfo?.size || 8;
  const pondX = forestInfo?.pondX || 3;
  const pondY = forestInfo?.pondY || 3;
  const assetKeyById = useMemo(() => {
    const map = new Map<number, string>();
    const assets = forestInfo?.assets;
    assets?.forEach((a) => {
      if (a && a.id != null && a.spriteKey) map.set(a.id, a.spriteKey);
    });
    return map;
  }, [forestInfo]);
  
  // 물 타일인지 확인 (pondX, pondY 기준으로 2x2 영역)
  const isWater = (c: Cell) => 
    c.x >= pondX && c.z >= pondY && 
    c.x <= pondX + 1 && c.z <= pondY + 1;
  
  // 확장 가능한 흙 타일인지 확인 (잔디 영역 바로 바깥쪽 1줄)
  const isExpandableArea = (ix: number, iz: number) => {
    // 현재 잔디 영역은 0 ~ forestSize-1
    // 확장 가능 영역: 잔디 영역에 인접한 바깥쪽 1줄만
    const isOutsideGrass = ix < 0 || ix >= forestSize || iz < 0 || iz >= forestSize;
    
    if (!isOutsideGrass) return false;
    
    // 정확히 잔디 경계에서 1칸 떨어진 영역만 확장 가능
    const isAdjacentToGrass = 
      (ix === -1 && iz >= -1 && iz <= forestSize) ||           // 왼쪽 경계
      (ix === forestSize && iz >= -1 && iz <= forestSize) ||   // 오른쪽 경계  
      (iz === -1 && ix >= -1 && ix <= forestSize) ||           // 위쪽 경계
      (iz === forestSize && ix >= -1 && ix <= forestSize);     // 아래쪽 경계
    
    return isAdjacentToGrass;
  };
  
  // 선택된 셀인지 확인하는 함수
  const isSelectedCell = (cell: Cell) => {
    return selectedCell && selectedCell.x === cell.x && selectedCell.z === cell.z;
  };

  // Deterministic pseudo-random (0..1) based on tile coords
  const rand01 = (x: number, z: number, seed = 1337) => {
    let n = (x | 0) * 374761393 + ((z | 0) * 668265263) + seed;
    n = (n ^ (n >>> 13)) >>> 0;
    n = (n * 1274126177) >>> 0;
    return (n >>> 0) / 0x100000000;
  };

  // Background/dirt variant per tile (previous randomizer - kept for reference)
  const getDirtImage = (x: number, z: number) => {
    const r = rand01(x, z);
    if (r < 0.05) return DIRT_PLAIN_IMG; // a few bare dirt tiles
    if (r < 0.35) return GRASS_DARK;      // patchy grass-dirt
    if (r < 0.70) return GRASS_WEEDS;       // weeds
    return GRASS_IMG;                    // full grass
  };

  // Island-like concentric lines around plantable square
  const getStripBackground = (x: number, z: number) => {
    // Inside plantable area
    if (x >= 0 && x < forestSize && z >= 0 && z < forestSize) {
      return GRASS_IMG;
    }
    // Distance (in grid lines) outside the square
    const dx = x < 0 ? -x : (x - (forestSize - 1));
    const dz = z < 0 ? -z : (z - (forestSize - 1));
    const outside = Math.max(dx, dz); // Chebyshev distance from boundary
    if (outside === 1) return GRASS_DARK;     // first line
    if (outside === 2) return DIRT_PLAIN_IMG;     // second line
    return WATER_IMG;                              // beyond -> water
  };

  // Slight variation on grass top faces (non-water)
  const getGrassTopImage = (x: number, z: number) => {
    const r = rand01(x * 3, z * 3, 911);
    if (r < 0.12) return GRASS_WEEDS;  // subtle weeds
    if (r < 0.22) return GRASS_DARK; // darker patch
    return GRASS_IMG;
  };

  // 죽은 나무인지 확인하는 함수
  const getDeadTreeAt = (x: number, z: number) => {
    if (!forestInfo?.trees) return null;
    
    return forestInfo.trees.find(tree => 
      tree.x === x && 
      tree.y === z && 
      (tree.health === 0 || tree.isDead)
    );
  };

  // 기존 스텝 벡터/중심 추정 로직
  const c00 = cells.find((c) => c.x === 0 && c.z === 0);
  const c10 = cells.find((c) => c.x === 1 && c.z === 0);
  const c01 = cells.find((c) => c.x === 0 && c.z === 1);

  const stepX =
    c00 && c10
      ? { dx: c10.sx - c00.sx, dy: c10.sy - c00.sy }
      : { dx: SPRITE_W / 2, dy: FOOT_H / 2 };
  const stepZ =
    c00 && c01
      ? { dx: c01.sx - c00.sx, dy: c01.sy - c00.sy }
      : { dx: -SPRITE_W / 2, dy: FOOT_H / 2 };

  const center = (() => {
    const sum = cells.reduce(
      (acc, c) => ({ sx: acc.sx + c.sx, sy: acc.sy + c.sy }),
      { sx: 0, sy: 0 }
    );
    const n = Math.max(cells.length, 1);
    return { sx: sum.sx / n, sy: sum.sy / n };
  })();

  // 동적 흙 타일 범위 (잔디 크기의 2배)
  const dirtSize = forestSize * 2;
  const dirtRange = Array.from({ length: dirtSize }, (_, i) => i);

  // Container center (for aligning board center to view center)
  const containerCenterX = layoutW > 0 ? layoutW / 2 : center.sx;
  const containerCenterY = layoutH && layoutH > 0 ? layoutH / 2 : center.sy;

  // 전체(잔디 + 외곽 흙) 타일 이미지의 경계 박스를 계산해 시각적 중심을 구한다
  const bounds = (() => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    // 잔디/물 셀들 (Layer 1)
    for (const c of cells) {
      const left = c.sx - SPRITE_W / 2;
      const top = c.sy - FOOT_H / 2 - WALL_H - TOP_FACE_H / 2;
      const right = left + SPRITE_W;
      const bottom = top + (FOOT_H + WALL_H);
      if (left < minX) minX = left;
      if (top < minY) minY = top;
      if (right > maxX) maxX = right;
      if (bottom > maxY) maxY = bottom;
    }
    // 외곽 흙 타일들 (Layer 0)
    const size = dirtSize;
    for (let ix = 0; ix < size; ix++) {
      for (let iz = 0; iz < size; iz++) {
        const rx = ix - (size / 2 - 0.5);
        const rz = iz - (size / 2 - 0.5);
        const sx = center.sx + rx * stepX.dx + rz * stepZ.dx;
        const sy = center.sy + rx * stepX.dy + rz * stepZ.dy;
        const actualX = ix - size / 2 + forestSize / 2;
        const actualZ = iz - size / 2 + forestSize / 2;
        const expandable = isExpandableArea(actualX, actualZ);
        const left = sx - SPRITE_W / 2;
        const top = expandable
          ? sy - FOOT_H / 2 - WALL_H
          : sy - FOOT_H / 2 - WALL_H + TOP_FACE_H / 2;
        const right = left + SPRITE_W;
        const bottom = top + (FOOT_H + WALL_H);
        if (left < minX) minX = left;
        if (top < minY) minY = top;
        if (right > maxX) maxX = right;
        if (bottom > maxY) maxY = bottom;
      }
    }
    // 3) 마커(나무) 이미지까지 포함하면 확대/축소 기준의 체감 중심이 더 안정적
    for (const m of markers) {
      const left = m.sx - MARKER_SIZE / 2;
      const top = m.sy - FOOT_H / 2 - WALL_H - MARKER_SIZE / 2 - 2;
      const right = left + MARKER_SIZE;
      const bottom = top + MARKER_SIZE;
      if (left < minX) minX = left;
      if (top < minY) minY = top;
      if (right > maxX) maxX = right;
      if (bottom > maxY) maxY = bottom;
    }
    return { minX, minY, maxX, maxY };
  })();

  const contentCenterX = (bounds.minX + bounds.maxX) / 2;
  const contentCenterY = (bounds.minY + bounds.maxY) / 2;
  const baseDX = containerCenterX - contentCenterX;
  const baseDY = containerCenterY - contentCenterY;

  // 보드의 상단면 중심(Y)의 평균으로 시각적 중앙을 계산
  const avgTopFaceCenterY = (() => {
    if (!cells?.length) return center.sy;
    let sum = 0;
    for (const c of cells) {
      const verts = getTopFaceVertices(c.sx, c.sy);
      const topFaceY = (verts[0][1] + verts[2][1]) / 2;
      sum += topFaceY;
    }
    return sum / cells.length;
  })();

  const boardCenterX = center.sx;
  const boardCenterY = avgTopFaceCenterY;
  
  // 최종 보드가 위치할 중심점
  const finalCenterX = containerCenterX;
  const finalCenterY = containerCenterY;

  return (
    <View style={s.board} pointerEvents="box-none">
      <View
        style={{
          flex: 1,
          transform: [
            // 컨테이너 중앙 기준으로 스케일
            { translateX: -containerCenterX },
            { translateY: -containerCenterY },
            { scale: zoom },
            { translateX: containerCenterX },
            { translateY: containerCenterY },
            // 전체(잔디+흙) 경계 박스 중심을 컨테이너 중앙에 정렬 (스케일 영향 없음)
            { translateX: baseDX },
            { translateY: baseDY },
          ],
        }}
      >
      {/* Layer 0: 바닥층 dirt (동적 크기) */}
      {dirtRange.map((ix) =>
        dirtRange.map((iz) => {
          const rx = ix - (dirtSize / 2 - 0.5);
          const rz = iz - (dirtSize / 2 - 0.5);
          const sx = center.sx + rx * stepX.dx + rz * stepZ.dx;
          const sy = center.sy + rx * stepX.dy + rz * stepZ.dy;

          // 실제 좌표계로 변환 (중심을 0,0으로)
          const actualX = ix - dirtSize / 2 + forestSize / 2;
          const actualZ = iz - dirtSize / 2 + forestSize / 2;
          
          const isExpandable = isExpandableArea(actualX, actualZ);

          return (
            <View key={`base-container-${ix}-${iz}`}>
              <TouchableOpacity pointerEvents="none"
                style={{
                  position: "absolute",
                  left: sx - SPRITE_W / 2,
                  top: (isExpandable
                  // 2층(잔디 외곽 1줄): 그대로 두어 3↔2 = 1칸 유지
                  ? sy - FOOT_H / 2 - WALL_H
                  // 1층(그 외곽의 넓은 흙): 반칸 더 내려서 2↔1 = 1칸로 맞춤
                  : sy - FOOT_H / 2 - WALL_H + TOP_FACE_H / 2),
                  width: SPRITE_W,
                  height: FOOT_H + WALL_H,
                  zIndex: isExpandable ? 1 : 0, // 확장 가능 영역만 더 높은 zIndex
                }}
                onPress={isExpandable ? onExpandableAreaPress : undefined}
                disabled={!isExpandable}
              >
                <Image
                  source={getStripBackground(actualX, actualZ)}
                  style={{
                    width: SPRITE_W,
                    height: FOOT_H + WALL_H,
                    resizeMode: "stretch",
                  }}
                  pointerEvents="none"
                />
              </TouchableOpacity>
              
              {/* 하이라이트를 별도 컨테이너로 분리 */}
              {isExpandable && (
                <View
                  style={{
                    position: "absolute",
                    left: sx - SPRITE_W / 2,
                    top: sy - FOOT_H / 2 - WALL_H / 2 - 16,
                    width: SPRITE_W,
                    height: FOOT_H + WALL_H,
                    zIndex: 0.5, // TouchableOpacity보다 낮은 zIndex
                  }}
                  pointerEvents="none"
                >
                  <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
                    <Path
                      d={buildPath(getTopFaceVertices((SPRITE_W / 2), (FOOT_H / 2) + WALL_H + 16))}
                      fill="rgba(255, 193, 7, 0.4)"
                      stroke="#FFC107"
                      strokeWidth={2}
                      strokeOpacity={0.8}
                    />
                  </Svg>
                </View>
              )} 
            </View>
          );
        })
      )}

      {/* Layer 1: 잔디/물 타일 (동적 크기) */}
      {cells.map((c) => {
        const tileSource = isWater(c) ? WATER_IMG : GRASS_IMG;
        return (
          <Image
            key={`cell-${c.x}-${c.z}`}
            source={tileSource}
            style={{
              position: "absolute",
              left: c.sx - SPRITE_W / 2,
              top: c.sy - FOOT_H / 2 - WALL_H - TOP_FACE_H / 2,
              width: SPRITE_W,
              height: FOOT_H + WALL_H,
              resizeMode: "stretch",
              zIndex: 1,
            }}
            pointerEvents="none"
          />
        );
      })}

      {/* Layer 2: 마커 (모든 나무 - 죽은 나무는 다른 에셋으로 표시) */}
      {markers.map((m) => {
        // 해당 위치의 나무 정보 찾기
        const treeInfo = forestInfo?.trees?.find(tree => tree.x === m.x && tree.y === m.z);
        
        return (
          <Image
            key={`marker-${m.x}-${m.z}`}
            source={(() => {
              const key = treeInfo?.assetId ? assetKeyById.get(treeInfo.assetId) : undefined;
              const sprite = key ? getSpriteByKey(key) : undefined;
              return sprite || getTreeAsset(
                m.growthStage,
                treeInfo?.isDead,
                treeInfo?.health,
                treeInfo?.maxHealth
              );
            })()}
            style={{
              position: "absolute",
              left: m.sx - MARKER_SIZE / 2,
              top: m.sy - FOOT_H / 2 - WALL_H - MARKER_SIZE / 2 - 2,
              width: MARKER_SIZE,
              height: MARKER_SIZE,
              resizeMode: "contain",
              zIndex: 2,
              elevation: 2,
            }}
            pointerEvents="none"
          />
        );
      })}

      {/* Layer 2.5: 죽은 나무에 대한 별도 터치 영역 */}
      {forestInfo?.trees
        ?.filter(tree => tree.health === 0 || tree.isDead)
        ?.map((tree) => {
          const cell = cells.find(c => c.x === tree.x && c.z === tree.y);
          if (!cell) return null;
          
          return (
            <TouchableOpacity
              key={`dead-tree-touch-${tree.treeId}`}
              style={{
                position: "absolute",
                left: cell.sx - MARKER_SIZE / 2,
                top: cell.sy - FOOT_H / 2 - WALL_H - MARKER_SIZE / 2 - 2,
                width: MARKER_SIZE,
                height: MARKER_SIZE,
                zIndex: 2.5,
                elevation: 2.5,
              }}
              onPress={() => onDeadTreePress(tree.treeId)}
            />
          );
        })}

      {/* Layer 3: 히트박스 + 하이라이트 (잔디 영역만) */}
      {layoutW > 0 && (
        <>
          <Svg
            style={[StyleSheet.absoluteFill, { zIndex: 3, elevation: 3 }]}
            pointerEvents="none"
          >
            {cells.map((c) => {
              const isSelected = isSelectedCell(c);
              return (
                <Path
                  key={`path-${c.x}-${c.z}`}
                  d={c.path}
                  fill={isSelected ? "rgba(255, 215, 0, 0.6)" : "#00FF00"}
                  fillOpacity={isSelected ? 0.6 : 0}
                  stroke={isSelected ? "#FFD700" : "#000"}
                  strokeOpacity={isSelected ? 1 : 0}
                  strokeWidth={isSelected ? 3 : 1}
                />
              );
            })}
          </Svg>

          {cells.map((c) => (
            <TouchableOpacity
              key={`cell-touch-${c.x}-${c.z}`}
              style={{
                position: "absolute",
                left: c.sx - SPRITE_W / 2,
                top: c.sy - FOOT_H / 2 - WALL_H - TOP_FACE_H / 2,
                width: SPRITE_W,
                height: FOOT_H + WALL_H,
                zIndex: 4,
              }}
              onPress={() => onCellPress(c)}
              activeOpacity={1}
            />
          ))}
        </>
      )}
      </View>
    </View>
  );
}
