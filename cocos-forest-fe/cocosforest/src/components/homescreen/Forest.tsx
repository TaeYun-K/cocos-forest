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
  forestInfo?: ForestInfoDto; // 죽은 나무 정보를 위해 추가
  onDeadTreePress: (treeId: number) => void; // 죽은 나무 클릭 핸들러 추가
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
}: Props) {
  const isWater = (c: Cell) => c.x >= 3 && c.z >= 3 && c.x <= 4 && c.z <= 4;
  
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

  const RANGE16 = Array.from({ length: 16 }, (_, i) => i);

  return (
    <View style={s.board} pointerEvents="box-none">
      {/* Layer 0: 바닥층 dirt (16×16) */}
      {RANGE16.map((ix) =>
        RANGE16.map((iz) => {
          const rx = ix - 7.5;
          const rz = iz - 7.5;
          const sx = center.sx + rx * stepX.dx + rz * stepZ.dx;
          const sy = center.sy + rx * stepX.dy + rz * stepZ.dy;

          return (
            <Image
              key={`base16-${ix}-${iz}`}
              source={DIRT_IMG}
              style={{
                position: "absolute",
                left: sx - SPRITE_W / 2,
                top: sy - FOOT_H / 2 - WALL_H,
                width: SPRITE_W,
                height: FOOT_H + WALL_H,
                resizeMode: "stretch",
                zIndex: 0,
              }}
              pointerEvents="none"
            />
          );
        })
      )}

      {/* Layer 1: 기존 8×8 상층(잔디/물) */}
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

      {/* Layer 2.5: 죽은 나무에 대한 별도 터치 영역 (에셋이 경고 표시인 경우) */}
      {forestInfo?.trees
        ?.filter(tree => tree.health === 0 || tree.isDead)
        ?.map((tree) => {
          // 해당 위치의 셀 찾기
          const cell = cells.find(c => c.x === tree.x && c.z === tree.y);
          if (!cell) {
            console.log(`Dead tree at ${tree.x}, ${tree.y} - no matching cell found`);
            return null;
          }
          
          console.log(`Adding touch area for dead tree at ${tree.x}, ${tree.y}`, tree);
          
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
              onPress={() => {
                console.log('Dead tree pressed:', tree.treeId);
                onDeadTreePress(tree.treeId);
              }}
            />
          );
        })}

      {/* Layer 3: 히트박스 + 하이라이트 */}
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
                    ? "rgba(255, 215, 0, 0.6)"  // 선택된 셀: 골드 색상
                    : showHitbox 
                      ? "rgba(0,255,0,0.3)" 
                      : "#00FF00"
                }
                fillOpacity={
                  isSelected 
                    ? 0.6  // 선택된 셀: 더 진한 투명도
                    : showHitbox 
                      ? 0.3 
                      : 0
                }
                stroke={
                  isSelected 
                    ? "#FFD700"  // 선택된 셀: 골드 테두리
                    : showHitbox 
                      ? "blue" 
                      : "#000"
                }
                strokeOpacity={
                  isSelected 
                    ? 1  // 선택된 셀: 완전 불투명 테두리
                    : showHitbox 
                      ? 1 
                      : 0
                }
                strokeWidth={isSelected ? 3 : 1}  // 선택된 셀: 더 굵은 테두리
                onPress={() => onCellPress(c)}
              />
            );
          })}
        </Svg>
      )}
    </View>
  );
}