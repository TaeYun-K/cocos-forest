import React, { useState, useCallback, useEffect } from "react";
import { View, Text, Modal, Pressable, LayoutChangeEvent } from "react-native";
import InfoBar from "../components/homescreen/InfoBar";
import Coco from "../components/homescreen/Coco";
import Board from "../components/homescreen/Forest";
import { homeStyles as s } from "../styles/homeStyles";
import { computeTopMargin } from "../utils/iso";
import { useCells, projectMarkers, useMarkerSet } from "../hooks/useForestData";
import type { Cell, Marker } from "../types/forest";
import { fetchForestInfo, fetchPoints } from "../api/home";

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
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false); // 나무심기/물주기 로딩

  // 원본 마커 좌표 저장용 (재투영을 위해)
  const [originalMarkers, setOriginalMarkers] = useState<
    Array<{ x: number; z: number }>
  >([]);

  // 나무 정보 저장용 (체력 등 상세 정보)
  const [treeData, setTreeData] = useState<
    Array<{
      x: number;
      y: number;
      treeId: number;
      health: number;
      maxHealth: number;
      growthStage: string;
      isDead: boolean;
      waterCountToday: number;
      lastWateredDate: string | null;
    }>
  >([]);

  // 홈 화면 진입시마다 API 호출 (대시보드처럼)
  useEffect(() => {
    const loadForestData = async () => {
      try {
        setLoading(true);

        // 병렬로 숲 정보와 포인트 정보 조회
        const [forestInfo, pointsData] = await Promise.all([
          fetchForestInfo(),
          fetchPoints(),
        ]);

        // trees 배열을 markers 형태로 변환 (x, y -> x, z)
        const treeMarkers = forestInfo.trees.map((tree) => ({
          x: tree.x,
          z: tree.y,
        }));
        setOriginalMarkers(treeMarkers);

        // 나무 상세 정보 저장
        setTreeData(forestInfo.trees);

        // 성장률 계산 (살아있는 나무 / 전체 나무 * 100)
        const growthRate =
          forestInfo.trees.length > 0
            ? Math.round(
                (forestInfo.aliveTreeCount / forestInfo.trees.length) * 100
              )
            : 0;
        setGrowth(growthRate);

        // 포인트 데이터 처리 (숫자가 바로 반환됨)
        setPoints(pointsData.toLocaleString() + " P");
      } catch (error) {
        console.error("Failed to load forest data:", error);
        // 실패시에도 UI는 동작하도록 기본값 유지
      } finally {
        setLoading(false);
      }
    };

    // 화면에 들어올 때마다 API 호출
    loadForestData();
  }, []); // 컴포넌트 마운트시마다 실행

  // 레이아웃 변경 시 마커 위치 재투영
  useEffect(() => {
    if (originalMarkers.length > 0 && centerX > 0 && topMargin > 0) {
      setMarkers(projectMarkers(originalMarkers, centerX, topMargin));
    }
  }, [originalMarkers, centerX, topMargin]);

  const handleCellPress = useCallback((cell: Cell) => {
    setSelected(cell);
    setModalVisible(true);
  }, []);

  // 나무 심기 핸들러
  const handlePlantTree = async () => {
    if (!selected || actionLoading) return;

    try {
      setActionLoading(true);

      // 나무 심기 API 호출 (z를 y로 변환)
      await plantTree(selected.x, selected.z);

      // 성공 후 숲 데이터 다시 로드
      const [forestInfo, pointsData] = await Promise.all([
        fetchForestInfo(),
        fetchPoints(),
      ]);

      // 데이터 업데이트
      const treeMarkers = forestInfo.trees.map((tree) => ({
        x: tree.x,
        z: tree.y,
      }));
      setOriginalMarkers(treeMarkers);
      setTreeData(forestInfo.trees);

      const growthRate =
        forestInfo.trees.length > 0
          ? Math.round(
              (forestInfo.aliveTreeCount / forestInfo.trees.length) * 100
            )
          : 0;
      setGrowth(growthRate);
      setPoints(pointsData.toLocaleString() + " P");

      // 모달 닫기
      setModalVisible(false);
    } catch (error) {
      console.error("나무 심기 실패:", error);
      // 에러 처리 (토스트 메시지나 알림 등)
      alert(
        "나무 심기에 실패했습니다. 포인트가 부족하거나 이미 나무가 있을 수 있습니다."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const isMarked = selected
    ? markerSet.has(`${selected.x},${selected.z}`)
    : false;

  // 선택된 셀의 나무 정보 찾기
  const selectedTree =
    selected && isMarked
      ? treeData.find((tree) => tree.x === selected.x && tree.y === selected.z)
      : null;

  // 체력 상태에 따른 색상
  const getHealthColor = (health: number, maxHealth: number) => {
    const percentage = (health / maxHealth) * 100;
    if (percentage >= 70) return "#10B981"; // 건강 (녹색)
    if (percentage >= 40) return "#F59E0B"; // 보통 (주황)
    return "#EF4444"; // 위험 (빨강)
  };

  return (
    <View style={s.container}>
      <InfoBar
        points={loading ? "로딩 중..." : points}
        growth={loading ? "0" : String(growth)}
      />
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

            {/* 나무가 있는 경우 상세 정보 표시 */}
            {selectedTree ? (
              <View style={{ marginVertical: 10 }}>
                <Text
                  style={[s.modalHint, { fontSize: 16, fontWeight: "bold" }]}
                >
                  🌳 나무 정보
                </Text>
                <View
                  style={{
                    backgroundColor: "#F3F4F6",
                    padding: 10,
                    borderRadius: 8,
                    marginTop: 5,
                  }}
                >
                  <Text style={{ fontSize: 14, marginBottom: 4 }}>
                    <Text style={{ fontWeight: "bold" }}>체력: </Text>
                    <Text
                      style={{
                        color: getHealthColor(
                          selectedTree.health,
                          selectedTree.maxHealth
                        ),
                        fontWeight: "bold",
                      }}
                    >
                      {selectedTree.health}/{selectedTree.maxHealth}
                    </Text>
                    <Text style={{ color: "#6B7280" }}>
                      (
                      {Math.round(
                        (selectedTree.health / selectedTree.maxHealth) * 100
                      )}
                      %)
                    </Text>
                  </Text>
                  <Text style={{ fontSize: 14, marginBottom: 4 }}>
                    <Text style={{ fontWeight: "bold" }}>성장 단계: </Text>
                    <Text style={{ color: "#374151" }}>
                      {selectedTree.growthStage}
                    </Text>
                  </Text>
                  <Text style={{ fontSize: 14, marginBottom: 4 }}>
                    <Text style={{ fontWeight: "bold" }}>오늘 물준 횟수: </Text>
                    <Text style={{ color: "#3B82F6" }}>
                      {selectedTree.waterCountToday}회
                    </Text>
                  </Text>
                  {selectedTree.lastWateredDate && (
                    <Text style={{ fontSize: 14 }}>
                      <Text style={{ fontWeight: "bold" }}>
                        마지막 물준 날:{" "}
                      </Text>
                      <Text style={{ color: "#6B7280" }}>
                        {selectedTree.lastWateredDate}
                      </Text>
                    </Text>
                  )}
                  {selectedTree.isDead && (
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#EF4444",
                        fontWeight: "bold",
                        marginTop: 4,
                      }}
                    >
                      💀 나무가 죽었습니다
                    </Text>
                  )}
                </View>
              </View>
            ) : (
              <Text style={s.modalHint}>나무심기</Text>
            )}

            {/* 액션 버튼들 */}
            <View style={{ flexDirection: "row", gap: 10, marginTop: 15 }}>
              {!isMarked && (
                <Pressable
                  style={[
                    s.modalBtn,
                    {
                      backgroundColor: actionLoading ? "#9CA3AF" : "#10B981",
                      flex: 1,
                    },
                  ]}
                  onPress={handlePlantTree}
                  disabled={actionLoading}
                >
                  <Text style={s.modalBtnText}>
                    {actionLoading ? "심는중..." : "나무 심기"}
                  </Text>
                </Pressable>
              )}

              {isMarked && selectedTree && !selectedTree.isDead && (
                <Pressable
                  style={[
                    s.modalBtn,
                    {
                      backgroundColor: actionLoading ? "#9CA3AF" : "#3B82F6",
                      flex: 1,
                    },
                  ]}
                  onPress={() => {
                    // TODO: 물주기 API 구현 후 추가
                    alert("물주기 기능은 곧 추가됩니다!");
                  }}
                  disabled={actionLoading}
                >
                  <Text style={s.modalBtnText}>
                    {actionLoading ? "물주는중..." : "💧 물주기"}
                  </Text>
                </Pressable>
              )}

              <Pressable
                style={[
                  s.modalBtn,
                  {
                    backgroundColor: "#6B7280",
                    flex: 1,
                  },
                ]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={s.modalBtnText}>닫기</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
