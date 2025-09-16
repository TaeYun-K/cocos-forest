import React from "react";
import { View, Image, StyleSheet } from "react-native";
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

const DIRT_IMG = require("../../../assets/tiles/dirt.png"); // ✅ 바닥층
const GRASS_IMG = require("../../../assets/tiles/grass.png");
const WATER_IMG = require("../../../assets/tiles/water.png");
const MARKER_IMG = require("../../../assets/models/tree.png");

type Props = {
  cells: Cell[];
  markers: Marker[];
  layoutW: number;
  showHitbox: boolean;
  onCellPress: (cell: Cell) => void;
};

// ...상단 import와 상수 동일

export default function Board({
  cells,
  markers,
  layoutW,
  showHitbox,
  onCellPress,
}: Props) {
  const isWater = (c: Cell) => c.x >= 3 && c.z >= 3 && c.x <= 4 && c.z <= 4;

  // ===== ① 기존 cells로부터 스텝 벡터/중심 추정 =====
  // (x+1, z) - (x, z)
  const c00 = cells.find((c) => c.x === 0 && c.z === 0);
  const c10 = cells.find((c) => c.x === 1 && c.z === 0);
  const c01 = cells.find((c) => c.x === 0 && c.z === 1);

  // 안전장치: 못 찾았을 경우 근접한 페어로 보정
  const fallback = cells[0];
  const stepX =
    c00 && c10
      ? { dx: c10.sx - c00.sx, dy: c10.sy - c00.sy }
      : { dx: SPRITE_W / 2, dy: FOOT_H / 2 }; // 대략적인 아이소 스텝
  const stepZ =
    c00 && c01
      ? { dx: c01.sx - c00.sx, dy: c01.sy - c00.sy }
      : { dx: -SPRITE_W / 2, dy: FOOT_H / 2 };

  // 현 8×8 그리드의 "화면상 중심"
  const center = (() => {
    const sum = cells.reduce(
      (acc, c) => ({ sx: acc.sx + c.sx, sy: acc.sy + c.sy }),
      { sx: 0, sy: 0 }
    );
    const n = Math.max(cells.length, 1);
    return { sx: sum.sx / n, sy: sum.sy / n };
  })();

  // 16×16 범위 인덱스
  const RANGE16 = Array.from({ length: 16 }, (_, i) => i);

  return (
    <View style={s.board} pointerEvents="box-none">
      {/* ===== Layer 0: 바닥층 dirt (16×16), 오프셋 규칙은 기존과 동일 ===== */}
      {RANGE16.map((ix) =>
        RANGE16.map((iz) => {
          // 16×16의 중심은 (7.5, 7.5)
          const rx = ix - 7.5;
          const rz = iz - 7.5;

          // 중심을 기준으로 아이소 스텝 누적
          const sx = center.sx + rx * stepX.dx + rz * stepZ.dx;
          const sy = center.sy + rx * stepX.dy + rz * stepZ.dy;

          return (
            <Image
              key={`base16-${ix}-${iz}`}
              source={DIRT_IMG}
              style={{
                position: "absolute",
                left: sx - SPRITE_W / 2,
                // ✅ 오프셋은 "지금이 딱 맞으니" 기존 바닥층 규칙 그대로 유지
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

      {/* ===== Layer 1: 기존 8×8 상층(잔디/물) — 변경 없음 ===== */}
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

      {/* ===== Layer 2: 마커 ===== */}
      {markers.map((m) => (
        <Image
          key={`marker-${m.x}-${m.z}`}
          source={MARKER_IMG}
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
      ))}

      {/* ===== Layer 3: 히트박스 ===== */}
      {layoutW > 0 && (
        <Svg
          style={[StyleSheet.absoluteFill, { zIndex: 3, elevation: 3 }]}
          pointerEvents="box-none"
        >
          {cells.map((c) => (
            <Path
              key={`path-${c.x}-${c.z}`}
              d={c.path}
              fill={showHitbox ? "rgba(0,255,0,0.3)" : "#00FF00"}
              fillOpacity={showHitbox ? 0.3 : 0}
              stroke={showHitbox ? "blue" : "#000"}
              strokeOpacity={showHitbox ? 1 : 0}
              strokeWidth={1}
              onPress={() => onCellPress(c)}
            />
          ))}
        </Svg>
      )}
    </View>
  );
}
