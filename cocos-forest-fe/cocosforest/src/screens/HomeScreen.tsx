import React, { useMemo, useState, useCallback } from "react";
import { View, Text, StyleSheet, Modal, Pressable, Image } from "react-native";
import Svg, { Path } from "react-native-svg";

type Cell = { x: number; z: number; sx: number; sy: number; path: string };
type Marker = { x: number; z: number; sx: number; sy: number };

const GRID = 8;

const SPRITE_W = 64;
const FOOT_H = 32;
const WALL_H = 32;
const TOP_FACE_H = 32;

const MARKER_SIZE = 64;
const MARKER_IMG = require("../../assets/models/tree.png");
const CUBE_IMG = require("../../assets/tiles/grass.png");
const COCO_IMG = require("../../assets/coco.png");

// Convert grid (x,z) to isometric screen (sx,sy)
function toScreen(x: number, z: number, centerX: number, topMargin: number) {
  const sx = (x - z) * (SPRITE_W / 2) + centerX;
  const sy = (x + z) * (FOOT_H / 2) + topMargin;
  return { sx, sy };
}

// Compute top face vertices for hit area path
function getTopFaceVertices(sx: number, sy: number) {
  const halfW = SPRITE_W / 2;
  const halfH = TOP_FACE_H / 2;
  const topFaceCenterY = sy - FOOT_H / 2 - WALL_H + halfH;

  const top = [sx, topFaceCenterY - halfH];
  const right = [sx + halfW, topFaceCenterY];
  const bottom = [sx, topFaceCenterY + halfH];
  const left = [sx - halfW, topFaceCenterY];

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

  const cells = useMemo<Cell[]>(() => {
    const arr: Cell[] = [];
    for (let z = 0; z < GRID; z++) {
      for (let x = 0; x < GRID; x++) {
        const { sx, sy } = toScreen(x, z, centerX, topMargin);
        const vertices = getTopFaceVertices(sx, sy);
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
  // Test toggle for hitbox (checkbox area) visibility
  const [showHitbox, setShowHitbox] = useState(true);
  // Coco speech bubble toggle
  const [showCocoTip, setShowCocoTip] = useState(false);

  const handleCubePress = useCallback((cell: Cell) => {
    setSelected(cell);
    setVisible(true);
  }, []);

  const isMarked = selected
    ? markerSet.has(`${selected.x},${selected.z}`)
    : false;

  return (
    <View style={styles.container}>
      {/* Info bar under header (hard-coded) */}
      <View style={styles.infoBar}>
        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>보유 포인트</Text>
          <Text style={styles.infoValue}>12,345 P</Text>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>숲 성장률</Text>
          <Text style={[styles.infoValue, styles.growthValue]}>73%</Text>
        </View>
      </View>

      {/* Coco character button + speech bubble */}
      <View style={styles.cocoRow}>
        <Pressable
          onPress={() => setShowCocoTip((v) => !v)}
          style={styles.cocoBtn}
          accessibilityLabel="코코 말풍선 토글"
        >
          <Image source={COCO_IMG} style={styles.cocoImg} />
        </Pressable>
        {showCocoTip && (
          <View style={styles.bubbleWrap}>
            <View style={styles.bubble}>
              <Text style={styles.bubbleText}>
                음식물 쓰레기를 줄이면 메탄가스 배출을 크게 감소시킬 수 있어요!
                🥬
              </Text>
            </View>
            <View style={styles.bubbleTail} />
          </View>
        )}
      </View>

      <View style={styles.board} onLayout={onLayout}>
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

        {/* Marker images */}
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

        {/* SVG hit areas for cubes */}
        {layout.w > 0 && (
          <Svg style={StyleSheet.absoluteFill}>
            {cells.map((c) => (
              <Path
                key={`path-${c.x}-${c.z}`}
                d={c.path}
                fill={showHitbox ? "rgba(0, 255, 0, 0.3)" : "#00FF00"}
                fillOpacity={showHitbox ? 0.3 : 0}
                stroke={showHitbox ? "blue" : "#000"}
                strokeOpacity={showHitbox ? 1 : 0}
                strokeWidth={1}
                onPress={() => handleCubePress(c)}
              />
            ))}
          </Svg>
        )}
      </View>

      {/* Test toggle button (bottom-right) */}
      <Pressable
        onPress={() => setShowHitbox((v) => !v)}
        style={[
          styles.fab,
          { backgroundColor: showHitbox ? "#10B981" : "#9CA3AF" },
        ]}
      >
        <Text style={styles.fabText}>
          {showHitbox ? "히트박스 ON" : "히트박스 OFF"}
        </Text>
      </Pressable>

      {/* Modal */}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>셀 정보</Text>
            <Text style={styles.modalText}>
              좌표: x = {selected?.x}, z = {selected?.z}
            </Text>
            <Text style={styles.modalHint}>
              {isMarked ? "물주기" : "나무심기"}
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
  container: { flex: 1, backgroundColor: "#DCFCE7" },
  board: { flex: 1 },

  // Info bar styles
  infoBar: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  infoBlock: { gap: 4, flex: 1 },
  infoLabel: { fontSize: 13, color: "#6b7280", fontWeight: "600" },
  infoValue: { fontSize: 18, color: "#CA8A04", fontWeight: "700" },
  growthValue: { color: "#15803D" },
  infoDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#e5e7eb",
    marginHorizontal: 12,
  },

  // Coco row and speech bubble
  cocoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 8,
    gap: 10,
  },
  cocoBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cocoImg: { width: 44, height: 44, resizeMode: "contain" },
  bubbleWrap: { position: "relative", flexShrink: 1 },
  bubble: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: 260,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  bubbleText: { color: "#111827", fontSize: 13, lineHeight: 18 },
  bubbleTail: {
    position: "absolute",
    left: -6,
    top: 16,
    width: 12,
    height: 12,
    backgroundColor: "#ffffff",
    transform: [{ rotate: "45deg" }],
  },

  // Toggle button
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9999,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  fabText: { color: "#fff", fontWeight: "700", fontSize: 12 },

  // Modal styles
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
