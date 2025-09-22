//Forest.tsx
import React from "react";
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

const DIRT_IMG = require("../../../assets/tiles/dirt.png");
const GRASS_IMG = require("../../../assets/tiles/grass.png");
const WATER_IMG = require("../../../assets/tiles/water.png");
const MARKER_IMG = require("../../../assets/models/medium_tree.png");

const SMALL_TREE_IMG = require("../../../assets/models/small_tree.png");
const MEDIUM_TREE_IMG = require("../../../assets/models/medium_tree.png");
const LARGE_TREE_IMG = require("../../../assets/models/medium_tree.png");

// dead tree asset
const DEAD_TREE_WARNING_IMG = require("../../../assets/tiles/alert.png");

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
  showHitbox: boolean;
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
  showHitbox,
  onCellPress,
  selectedCell,
  forestInfo,
  onDeadTreePress,
  onExpandableAreaPress,
}: Props) {
  const forestSize = forestInfo?.size || 8;
  const pondX = forestInfo?.pondX || 3;
  const pondY = forestInfo?.pondY || 3;
  
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

  return (
    <View style={s.board} pointerEvents="box-none">
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
              <TouchableOpacity
                style={{
                  position: "absolute",
                  left: sx - SPRITE_W / 2,
                  top: sy - FOOT_H / 2 - WALL_H,
                  width: SPRITE_W,
                  height: FOOT_H + WALL_H,
                  zIndex: isExpandable ? 1 : 0, // 확장 가능 영역만 더 높은 zIndex
                }}
                onPress={isExpandable ? onExpandableAreaPress : undefined}
                disabled={!isExpandable}
              >
                <Image
                  source={DIRT_IMG}
                  style={{
                    width: SPRITE_W,
                    height: FOOT_H + WALL_H,
                    resizeMode: "stretch",
                  }}
                  pointerEvents="none"
                />
              </TouchableOpacity>
              
              {/* 하이라이트를 별도 컨테이너로 분리 */}
              {/* {isExpandable && (
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
              )} */}
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
            source={getTreeAsset(
              m.growthStage, 
              treeInfo?.isDead, 
              treeInfo?.health, 
              treeInfo?.maxHealth
            )}
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
        <Svg
          style={[StyleSheet.absoluteFill, { zIndex: 3, elevation: 3 }]}
          pointerEvents="box-none"
        >
          {cells.map((c) => {
            const isSelected = isSelectedCell(c);
            
            return (
              <Path
                key={`path-${c.x}-${c.z}`}
                d={c.path}
                fill={
                  isSelected 
                    ? "rgba(255, 215, 0, 0.6)"
                    : showHitbox 
                      ? "rgba(0,255,0,0.3)" 
                      : "#00FF00"
                }
                fillOpacity={
                  isSelected 
                    ? 0.6
                    : showHitbox 
                      ? 0.3 
                      : 0
                }
                stroke={
                  isSelected 
                    ? "#FFD700"
                    : showHitbox 
                      ? "blue" 
                      : "#000"
                }
                strokeOpacity={
                  isSelected 
                    ? 1
                    : showHitbox 
                      ? 1 
                      : 0
                }
                strokeWidth={isSelected ? 3 : 1}
                onPress={() => onCellPress(c)}
              />
            );
          })}
        </Svg>
      )}
    </View>
  );
}