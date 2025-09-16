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

const CUBE_IMG = require("../../../assets/tiles/grass.png");
const MARKER_IMG = require("../../../assets/models/tree.png");

type Props = {
  cells: Cell[];
  markers: Marker[];
  layoutW: number;
  showHitbox: boolean;
  onCellPress: (cell: Cell) => void;
};

export default function Board({
  cells,
  markers,
  layoutW,
  showHitbox,
  onCellPress,
}: Props) {
  return (
    // 히트박스가 최상위에서 터치 받도록 absolute children z-order 사용
    <View style={s.board} pointerEvents="box-none">
      {/* 1) 타일 이미지 (맨 아래) */}
      {cells.map((c) => (
        <Image
          key={`cell-${c.x}-${c.z}`}
          source={CUBE_IMG}
          style={{
            position: "absolute",
            left: c.sx - SPRITE_W / 2,
            top: c.sy - FOOT_H / 2 - WALL_H - TOP_FACE_H / 2,
            width: SPRITE_W,
            height: FOOT_H + WALL_H,
            resizeMode: "stretch",
          }}
          pointerEvents="none"
        />
      ))}

      {/* 2) 마커(나무) - 히트박스 아래로 내리기 위해 SVG보다 먼저 렌더 */}
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
            // 혹시 플랫폼별 포인터 버그 대비
            zIndex: 1, // SVG(아래) zIndex: 2로 터치 우선권 줌
            elevation: 1,
          }}
          pointerEvents="none" // 클릭 막힘 방지 핵심
        />
      ))}

      {/* 3) SVG 히트 레이어 (최상위) */}
      {layoutW > 0 && (
        <Svg
          style={[StyleSheet.absoluteFill, { zIndex: 2, elevation: 2 }]}
          pointerEvents="box-none"
        >
          {cells.map((c) => (
            <Path
              key={`path-${c.x}-${c.z}`}
              d={c.path}
              fill={showHitbox ? "rgba(0, 255, 0, 0.3)" : "#00FF00"}
              fillOpacity={showHitbox ? 0.3 : 0}
              stroke={showHitbox ? "blue" : "#000"}
              strokeOpacity={showHitbox ? 1 : 0}
              strokeWidth={1}
              // Path 자체가 터치 타겟이 되게 함
              onPress={() => onCellPress(c)}
            />
          ))}
        </Svg>
      )}
    </View>
  );
}
