// HomeScreen.tsx
import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Image,
  GestureResponderEvent,
} from "react-native";
import Svg, { Path } from "react-native-svg"; // 1. SVG import

type Cell = { x: number; z: number; sx: number; sy: number; path: string }; // 윗면 Path 추가
type Marker = { x: number; z: number; sx: number; sy: number };

const GRID = 8;

const SPRITE_W = 64;
const FOOT_H = 32;
const WALL_H = 32;
const TOP_FACE_H = 32;

const MARKER_SIZE = 64;
const MARKER_IMG = require("../../assets/models/tree.png");
const CUBE_IMG = require("../../assets/tiles/grass.png");

// 등각 투영 (바닥 중심 기준)
function toScreen(x: number, z: number, centerX: number, topMargin: number) {
  const sx = (x - z) * (SPRITE_W / 2) + centerX;
  const sy = (x + z) * (FOOT_H / 2) + topMargin;
  return { sx, sy };
}

// 큐브 윗면 꼭짓점 좌표 계산 (수정)
function getTopFaceVertices(sx: number, sy: number) {
  const halfW = SPRITE_W / 2;
  const halfH = TOP_FACE_H / 2; // TOP_FACE_H 사용

  // 바닥 중심에서 윗면 다이아 중심까지의 상대 Y좌표를 다시 계산합니다.
  // 이 부분이 가장 중요합니다.
  // 큐브 이미지의 윗면은 'sy - FOOT_H/2 - WALL_H'에 위치하며,
  // 윗면 다이아의 중심은 이 Y좌표에서 TOP_FACE_H/2만큼 아래에 있습니다.
  const topFaceCenterY = sy - FOOT_H / 2 - WALL_H + halfH;

  const top = [sx, topFaceCenterY - halfH]; // 위쪽 끝
  const right = [sx + halfW, topFaceCenterY]; // 오른쪽 끝
  const bottom = [sx, topFaceCenterY + halfH]; // 아래쪽 끝
  const left = [sx - halfW, topFaceCenterY]; // 왼쪽 끝

  return [top, right, bottom, left];
}

const HomeScreen = () => {
  const [layout, setLayout] = useState<{ w: number; h: number }>({
    w: 0,
    h: 0,
  });
  const onLayout = (e: any) => {
    const { width, height } = e.nativeEvent.layout;
    setLayout({ w: width, h: height });
  };

  const centerX = layout.w / 2;
  const boardHeight = (GRID - 1 + GRID - 1) * (FOOT_H / 2) + FOOT_H + WALL_H;
  const topMargin = Math.max(12, (layout.h - boardHeight) / 2);

  // 타일 배치(뒤→앞 페인터스)
  const cells = useMemo<Cell[]>(() => {
    const arr: Cell[] = [];
    for (let z = 0; z < GRID; z++) {
      for (let x = 0; x < GRID; x++) {
        const { sx, sy } = toScreen(x, z, centerX, topMargin);
        const vertices = getTopFaceVertices(sx, sy);
        // SVG Path 데이터 생성: M(move) L(line) ... Z(close)
        const path = `M${vertices[0][0]} ${vertices[0][1]} L${vertices[1][0]} ${vertices[1][1]} L${vertices[2][0]} ${vertices[2][1]} L${vertices[3][0]} ${vertices[3][1]} Z`;
        arr.push({ x, z, sx, sy, path });
      }
    }
    arr.sort((a, b) => a.x + a.z - (b.x + b.z));
    return arr;
  }, [centerX, topMargin]);

  const markers = useMemo<Marker[]>(() => {
    const set = new Set<string>();
    while (set.size < 3) {
      const x = Math.floor(Math.random() * GRID);
      const z = Math.floor(Math.random() * GRID);
      set.add(`${x},${z}`);
    }
    return Array.from(set).map((key) => {
      const [x, z] = key.split(",").map(Number);
      const { sx, sy } = toScreen(x, z, centerX, topMargin);
      return { x, z, sx, sy };
    });
  }, [centerX, topMargin]);

  const markerSet = useMemo(
    () => new Set(markers.map((m) => `${m.x},${m.z}`)),
    [markers]
  );

  const [selected, setSelected] = useState<Cell | null>(null);
  const [visible, setVisible] = useState(false);

  // 개별 큐브 터치 처리 함수
  const handleCubePress = useCallback((cell: Cell) => {
    setSelected(cell);
    setVisible(true);
  }, []);

  const isMarked = selected
    ? markerSet.has(`${selected.x},${selected.z}`)
    : false;

  return (
    <View style={styles.container}>
      <View style={styles.board} onLayout={onLayout}>
        {cells.map((c) => (
          <Image
            key={`cell-${c.x}-${c.z}`}
            source={CUBE_IMG}
            style={{
              position: "absolute",
              left: c.sx - SPRITE_W / 2,
              // TOP_FACE_H 만큼 아래로 이동 (Y 좌표 증가)
              top: c.sy - FOOT_H / 2 - WALL_H - TOP_FACE_H / 2,
              width: SPRITE_W,
              height: FOOT_H + WALL_H,
              resizeMode: "stretch",
            }}
            pointerEvents="none"
          />
        ))}

        {/* 마커도 터치 통과 */}
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
            }}
            pointerEvents="none"
          />
        ))}

        {/* SVG 터치 레이어: 각 큐브의 윗면(마름모)에 정확히 일치하는 터치 박스 */}
        {layout.w > 0 && (
          <Svg style={StyleSheet.absoluteFill}>
            {cells.map((c) => (
              <Path
                key={`path-${c.x}-${c.z}`}
                d={c.path}
                // 터치박스를 반투명한 초록색으로 채우고, 파란색 테두리를 추가합니다.
                fill="rgba(0, 255, 0, 0.3)" // 반투명 초록색
                stroke="blue" // 파란색 테두리
                strokeWidth="1"
                onPress={() => handleCubePress(c)}
              />
            ))}
          </Svg>
        )}
      </View>

      {/* 모달 */}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>타일 정보</Text>
            <Text style={styles.modalText}>
              좌표: x = {selected?.x}, z = {selected?.z}
            </Text>
            <Text style={styles.modalHint}>
              {isMarked ? "설명: 물주기" : "설명: 나무심기"}
            </Text>
            <Pressable
              style={styles.modalBtn}
              onPress={() => setVisible(false)}
            >
              <Text style={styles.modalBtnText}>닫기</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0e1111" },
  board: { flex: 1 },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCard: {
    width: 300,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#1e1f24",
    gap: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#fff" },
  modalText: { fontSize: 16, color: "#dcdcdc" },
  modalHint: { fontSize: 15, color: "#a8e6cf" },
  modalBtn: {
    marginTop: 8,
    backgroundColor: "#3b82f6",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  modalBtnText: { color: "#fff", fontWeight: "700" },
});

export default HomeScreen;
