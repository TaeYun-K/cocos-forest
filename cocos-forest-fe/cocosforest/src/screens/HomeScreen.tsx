import React, { useState, useCallback, useEffect } from "react";
import { View, Text, Modal, Pressable, LayoutChangeEvent } from "react-native";
import InfoBar from "../components/homescreen/InfoBar";
import Coco from "../components/homescreen/Coco";
import Board from "../components/homescreen/Forest";
import { homeStyles as s } from "../styles/homeStyles";
import { computeTopMargin } from "../utils/iso";
import { useCells, projectMarkers, useMarkerSet } from "../hooks/useForestData";
import type { Cell, Marker } from "../types/forest";
import { fetchMarkers, fetchStats } from "../api/home";

export default function HomeScreen() {
  // 레이아웃
  const [layout, setLayout] = useState({ w: 0, h: 0 });
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setLayout({ w: width, h: height });
  };
  const centerX = layout.w / 2;
  const topMargin = computeTopMargin(layout.h);

  // 데이터 (셀/마커)
  const cells = useCells(centerX, topMargin);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const markerSet = useMarkerSet(markers);

  // UI 로컬 상태
  const [selected, setSelected] = useState<Cell | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showHitbox, setShowHitbox] = useState(true);
  const [showCocoTip, setShowCocoTip] = useState(false);

  // 포인트/성장률 (API)
  const [points, setPoints] = useState("0");
  const [growth, setGrowth] = useState(0);

  // API 호출
  useEffect(() => {
    (async () => {
      try {
        const [{ markers: markerCoords }, stats] = await Promise.all([
          fetchMarkers(),
          fetchStats(),
        ]);
        setMarkers(projectMarkers(markerCoords, centerX, topMargin));
        setPoints(stats.points.toLocaleString() + " P");
        setGrowth(stats.growth);
      } catch (e) {
        // 실패시에도 UI는 동작하도록 no-op
        // console.warn(e);
      }
    })();
  }, [centerX, topMargin]);

  // 반응형: 레이아웃 변하면 마커 위치 재투영
  useEffect(() => {
    setMarkers((prev) =>
      projectMarkers(
        prev.map(({ x, z }) => ({ x, z })),
        centerX,
        topMargin
      )
    );
  }, [centerX, topMargin]);

  const handleCellPress = useCallback((cell: Cell) => {
    setSelected(cell);
    setModalVisible(true);
  }, []);

  const isMarked = selected
    ? markerSet.has(`${selected.x},${selected.z}`)
    : false;

  return (
    <View style={s.container}>
      <InfoBar points={points} growth={String(growth)} />
      <Coco showTip={showCocoTip} onToggle={() => setShowCocoTip((v) => !v)} />

      <View style={{ flex: 1 }} onLayout={onLayout}>
        <Board
          cells={cells}
          markers={markers}
          layoutW={layout.w}
          showHitbox={showHitbox}
          onCellPress={handleCellPress}
        />
      </View>

      <Pressable
        onPress={() => setShowHitbox((v) => !v)}
        style={[s.fab, { backgroundColor: showHitbox ? "#10B981" : "#9CA3AF" }]}
      >
        <Text style={s.fabText}>
          {showHitbox ? "히트박스 ON" : "히트박스 OFF"}
        </Text>
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={s.modalBackdrop}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>셀 정보</Text>
            <Text style={s.modalText}>
              좌표: x = {selected?.x}, z = {selected?.z}
            </Text>
            <Text style={s.modalHint}>{isMarked ? "물주기" : "나무심기"}</Text>
            <Pressable
              style={s.modalBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={s.modalBtnText}>닫기</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
