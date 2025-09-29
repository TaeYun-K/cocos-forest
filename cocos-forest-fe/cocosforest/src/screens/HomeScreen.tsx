import React, { useState, useCallback, useEffect, useRef } from "react";
import { View, Text, Modal, Pressable, LayoutChangeEvent, Alert, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { PinchGestureHandler, PanGestureHandler, State as GestureState } from "react-native-gesture-handler";
import InfoBar from "../components/homescreen/InfoBar";
import Coco from "../components/homescreen/Coco";
import Board from "../components/homescreen/Forest";
import ExpandForestModal from "../components/homescreen/ExpandForestModal";
import { homeStyles as s } from "../styles/homeStyles";
import { computeTopMargin, computeBoardHeight, computeBoardWidth } from "../utils/iso";
import { useCells, projectMarkers, useMarkerSet } from "../hooks/useForestData";
import type { Cell, Marker, ForestInfoDto } from "../types/forest";
import { fetchForestInfo, fetchPoints, plantTree, waterTree, removeDeadTree, expandForest, listAssets, placeDecoration, removeDecoration, type AssetDto } from "../api/home";
import { getSpriteByKey } from "../assets/spriteMap";
import { LinearGradient } from "expo-linear-gradient";

export default function HomeScreen() {
  // 숲 정보 상태 (확장을 위해 최상단으로 이동)
  const [forestInfo, setForestInfo] = useState<ForestInfoDto | null>(null);
  const forestSize = forestInfo?.size || 8;

  // 레이아웃
  const [layout, setLayout] = useState({ w: 0, h: 0 });
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setLayout({ w: width, h: height });
  };
  const centerX = layout.w / 2;
  const topMargin = computeTopMargin(layout.h, forestSize); // 동적 크기 전달

  // 데이터 (셀/마커) - 동적 크기 사용
  const cells = useCells(centerX, topMargin, forestSize);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const markerSet = useMarkerSet(markers);

  // UI 로컬 상태
  const [selected, setSelected] = useState<Cell | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [expandModalVisible, setExpandModalVisible] = useState(false);
  const [showCocoTip, setShowCocoTip] = useState(false);
  // Asset catalog (for planting UI)
  const [assets, setAssets] = useState<AssetDto[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  const [installTab, setInstallTab] = useState<'PLANT' | 'DECO'>('PLANT');
  const PLANT_CATEGORY_IDS = [1, 2];

  // Zoom state (+ / - controls)
  const [zoom, setZoom] = useState(1);
  const MIN_ZOOM = 0.3;
  const MAX_ZOOM = 2.0;
  const ZOOM_STEP = 0.1;
  const incZoom = () => setZoom((z) => Math.min(MAX_ZOOM, parseFloat((z + ZOOM_STEP).toFixed(2))));
  const decZoom = () => setZoom((z) => Math.max(MIN_ZOOM, parseFloat((z - ZOOM_STEP).toFixed(2))));
  // Base zoom during pinch (so pinch scale multiplies this)
  const baseZoomRef = useRef(1);
  useEffect(() => {
    baseZoomRef.current = zoom;
  }, [zoom]);

  const clamp = (v: number) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, v));
  const onPinchEvent = (e: any) => {
    const scale = e?.nativeEvent?.scale ?? 1;
    const next = clamp(baseZoomRef.current * scale);
    setZoom(next);
  };
  const onPinchStateChange = (e: any) => {
    const state = e?.nativeEvent?.state;
    if (state === GestureState.BEGAN) {
      // sync base zoom at start
      baseZoomRef.current = zoom;
    }
    if (state === GestureState.END || state === GestureState.CANCELLED || state === GestureState.FAILED) {
      const scale = e?.nativeEvent?.scale ?? 1;
      const next = clamp(baseZoomRef.current * scale);
      baseZoomRef.current = next;
      setZoom(next);
    }
  };

  // Pan (drag) state for board-level translation
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const panBaseRef = useRef({ x: 0, y: 0 });
  const onPanEvent = (e: any) => {
    const tx = e?.nativeEvent?.translationX ?? 0;
    const ty = e?.nativeEvent?.translationY ?? 0;
    const { x: baseX, y: baseY } = panBaseRef.current;
    const { maxX, maxY } = getPanLimits(zoom);
    const nextX = Math.max(-maxX, Math.min(maxX, baseX + tx));
    const nextY = Math.max(-maxY, Math.min(maxY, baseY + ty));
    setPan({ x: nextX, y: nextY });
  };
  const onPanStateChange = (e: any) => {
    const state = e?.nativeEvent?.state;
    if (state === GestureState.BEGAN) {
      panBaseRef.current = { ...pan };
    }
    if (state === GestureState.END || state === GestureState.CANCELLED || state === GestureState.FAILED) {
      const tx = e?.nativeEvent?.translationX ?? 0;
      const ty = e?.nativeEvent?.translationY ?? 0;
      const { x: baseX, y: baseY } = panBaseRef.current;
      const { maxX, maxY } = getPanLimits(zoom);
      const nextX = Math.max(-maxX, Math.min(maxX, baseX + tx));
      const nextY = Math.max(-maxY, Math.min(maxY, baseY + ty));
      panBaseRef.current = { x: nextX, y: nextY };
      setPan(panBaseRef.current);
    }
  };

  // Pan limits based on content size vs container size and zoom
  const getPanLimits = (z: number) => {
    const contentW = computeBoardWidth(forestSize) * z;
    const contentH = computeBoardHeight(forestSize) * z;
    // Allow more slack so users can move further, especially horizontally.
    // Increase horizontal slack to make left/right panning feel roomier.
    const extraX = Math.max(180, layout.w * 0.35);  // was 15%
    const extraY = Math.max(240, layout.h * 0.8); // at least 240px or 80% of screen height
    const maxX = Math.max(0, (contentW - layout.w) / 2 + extraX);
    const maxY = Math.max(0, (contentH - layout.h) / 2 + extraY);
    return { maxX, maxY };
  };

  // When zoom or layout changes, clamp current pan within new limits
  useEffect(() => {
    const { maxX, maxY } = getPanLimits(zoom);
    setPan((p) => ({ x: Math.max(-maxX, Math.min(maxX, p.x)), y: Math.max(-maxY, Math.min(maxY, p.y)) }));
    const clamped = {
      x: Math.max(-maxX, Math.min(maxX, panBaseRef.current.x)),
      y: Math.max(-maxY, Math.min(maxY, panBaseRef.current.y)),
    };
    panBaseRef.current = clamped;
  }, [zoom, layout.w, layout.h, forestSize]);

  // 포인트/성장률 (API)
  const [points, setPoints] = useState("0");
  const [pointsNumber, setPointsNumber] = useState(0); // 숫자 형태로도 저장
  const [growth, setGrowth] = useState<string | number>(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [expandLoading, setExpandLoading] = useState(false);

  // 원본 마커 좌표 저장용 (재투영을 위해)
  const [originalMarkers, setOriginalMarkers] = useState<Array<{ x: number; z: number; growthStage: string }>>([]);
  
  // 나무 정보 저장용 (체력 등 상세 정보)
  const [treeData, setTreeData] = useState<Array<{
    x: number;
    y: number;
    treeId: number;
    health: number;
    maxHealth: number;
    growthStage: string;
    isDead: boolean;
    waterCountToday: number;
    lastWateredDate: string | null;
  }>>([]);

  // 숲 데이터 로드 함수 (재사용을 위해 분리)
  const loadForestData = async () => {
    try {
      setLoading(true);
      console.log("📥 숲 데이터 로드 시작...");

      // 병렬로 숲 정보와 포인트 정보 조회
      const [forestInfoData, pointsData] = await Promise.all([
        fetchForestInfo(),
        fetchPoints(),
      ]);

      console.log("🌳 받아온 숲 정보:", forestInfoData);
      console.log("🌳 나무 개수:", forestInfoData.trees.length);
      console.log("🌳 숲 크기:", forestInfoData.size);
      console.log('deco coords', forestInfo?.decorations?.slice(0,5));

      // 숲 정보 전체 저장
      setForestInfo(forestInfoData);

      const treeMarkers = forestInfoData.trees.map((tree) => ({
        x: tree.x,
        z: tree.y,
        growthStage: tree.growthStage,
        assetId: tree.assetId,
      }));
      setOriginalMarkers(treeMarkers);
      
      // 나무 상세 정보 저장
      setTreeData(forestInfoData.trees);

      // 나무 개수 표시 (살아있는 나무 개수/전체 나무 개수)
      const aliveTreeCount = forestInfoData.aliveTreeCount || 0;
      const totalTreeCount = forestInfoData.trees.length || 0;
      const treeCountDisplay = `${aliveTreeCount}/${totalTreeCount}`;
      setGrowth(treeCountDisplay);

      // 포인트 데이터 처리
      setPointsNumber(pointsData);
      setPoints(pointsData.toLocaleString() + " P");
      
      console.log("✅ 숲 데이터 로드 완료");
    } catch (error) {
      console.error("❌ Failed to load forest data:", error);
    } finally {
      setLoading(false);
    }
  };

  // 홈 화면 진입시마다 API 호출
  useEffect(() => {
    loadForestData();
  }, []);

  // 홈탭을 누를 때마다 데이터 새로고침
  useFocusEffect(
    useCallback(() => {
      console.log("🏠 홈탭 포커스 - 데이터 새로고침");
      loadForestData();
    }, [])
  );

  // 레이아웃 변경 시 마커 위치 재투영
  useEffect(() => {
    if (originalMarkers.length > 0 && centerX > 0 && topMargin > 0) {
      setMarkers(projectMarkers(originalMarkers, centerX, topMargin));
    }
  }, [originalMarkers, centerX, topMargin]);

  const handleCellPress = useCallback((cell: Cell) => {
    setSelected(cell);

    // If decoration exists at this cell, offer delete toggle
    const deco = forestInfo?.decorations?.find(d => d.x === cell.x && d.y === cell.z);
    if (deco) {
      Alert.alert(
        "장식 삭제",
        "이 칸의 장식을 삭제하시겠습니까? (포인트 전액 환불)",
        [
          { text: "취소", style: "cancel" },
          {
            text: "삭제",
            style: "destructive",
            onPress: async () => {
              try {
                setActionLoading(true);
                await removeDecoration(deco.id);
                await loadForestData();
                // 포인트 갱신
                const updatedPoints = await fetchPoints();
                setPointsNumber(updatedPoints);
                setPoints(updatedPoints.toLocaleString() + " P");
                setModalVisible(false);
                Alert.alert("완료", "장식을 삭제하고 환불되었습니다.");
              } catch (err) {
                console.error("remove decoration error:", err);
                Alert.alert("오류", "장식 삭제 중 오류가 발생했습니다.");
              } finally {
                setActionLoading(false);
              }
            },
          },
        ]
      );
      return; // don't open modal
    }

    // If empty cell or tree, open modal for plant/water/deco install
    setModalVisible(true);
    const exists = treeData.find(tree => tree.x === cell.x && tree.y === cell.z);
    if (!exists) {
      setSelectedAssetId(null);
      if (assets.length === 0) {
        loadAssetsForPlanting();
      }
    }
  }, [forestInfo?.decorations, treeData, assets.length, loadAssetsForPlanting]);

  // 확장 가능 영역 클릭 핸들러
  const handleExpandableAreaPress = useCallback(() => {
    setExpandModalVisible(true);
  }, []);

  // 숲 확장 핸들러
  const handleExpandForest = async () => {
    try {
      setExpandLoading(true);
      
      console.log("🌲 숲 확장 시작...");
      const expandedForestInfo = await expandForest();
      
      console.log("🌲 숲 확장 성공:", expandedForestInfo);
      
      // 확장된 숲 정보로 상태 업데이트
      setForestInfo(expandedForestInfo);
      
      const treeMarkers = expandedForestInfo.trees.map((tree) => ({
        x: tree.x,
        z: tree.y,
        growthStage: tree.growthStage,
        assetId: tree.assetId,
      }));
      setOriginalMarkers(treeMarkers);
      setTreeData(expandedForestInfo.trees);
      
      // 포인트 정보 새로고침
      const updatedPoints = await fetchPoints();
      setPointsNumber(updatedPoints);
      setPoints(updatedPoints.toLocaleString() + " P");
      
      // 모달 닫기
      setExpandModalVisible(false);
      
      Alert.alert("성공", "숲이 성공적으로 확장되었습니다! 🌲");
      
    } catch (error) {
      console.error("❌ 숲 확장 실패:", error);
      Alert.alert("실패", error.message || "숲 확장에 실패했습니다.");
    } finally {
      setExpandLoading(false);
    }
  };

  // 나무 심기 핸들러
  const handlePlantTree = async () => {
    if (!selected || actionLoading) return;
    if (!selectedAssetId) {
      Alert.alert("안내", "심을 나무를 선택해 주세요.");
      return;
    }
    
    try {
      setActionLoading(true);
      
      await plantTree(selected.x, selected.z, selectedAssetId);
      await loadForestData();
      setModalVisible(false);
      
    } catch (error) {
      console.error("나무 심기 실패:", error);
      alert("나무 심기에 실패했습니다. 포인트가 부족하거나 이미 나무가 있을 수 있습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  // 물주기 핸들러
  const handleWaterTree = async () => {
    if (!selectedTree || actionLoading) return;
    
    try {
      setActionLoading(true);
      
      await waterTree(selectedTree.treeId);
      await loadForestData();
      setModalVisible(false);
      
    } catch (error) {
      console.error("물주기 실패:", error);
      alert("물주기에 실패했습니다. 포인트가 부족하거나 오늘 이미 충분히 물을 줬을 수 있습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  // 장식 설치 핸들러
  const handlePlaceDecoration = async () => {
    if (!selected || actionLoading) return;
    if (!selectedAssetId) {
      Alert.alert("알림", "설치할 아이템을 선택해 주세요.");
      return;
    }

    try {
      setActionLoading(true);
      await placeDecoration(selected.x, selected.z, selectedAssetId);
      await loadForestData();
      setModalVisible(false);
    } catch (error) {
      console.error("place decoration error:", error);
      alert("구조물 설치에 실패했어요. 포인트가 부족하거나 이미 설치된 위치일 수 있어요.");
    } finally {
      setActionLoading(false);
    }
  };

  // 죽은 나무 클릭 핸들러
  const handleDeadTreePress = (treeId: number) => {
    Alert.alert(
      "죽은 나무 제거",
      "이 죽은 나무를 제거하시겠습니까?",
      [
        {
          text: "취소",
          style: "cancel",
        },
        {
          text: "제거",
          style: "destructive",
          onPress: () => handleRemoveDeadTree(treeId),
        },
      ]
    );
  };

  // 죽은 나무 제거 처리
  const handleRemoveDeadTree = async (treeId: number) => {
    try {
      setActionLoading(true);
      console.log("🗑️ 죽은 나무 제거 시작:", treeId);
      
      await removeDeadTree(treeId);
      console.log("✅ 죽은 나무 제거 API 성공");
      
      await loadForestData();
      Alert.alert("성공", "죽은 나무가 제거되었습니다.");
    } catch (error) {
      console.error("❌ 죽은 나무 제거 실패:", error);
      Alert.alert("실패", "죽은 나무 제거에 실패했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  const isMarked = selected
    ? markerSet.has(`${selected.x},${selected.z}`)
    : false;

  // 선택된 셀의 나무 정보 찾기
  const selectedTree = selected 
    ? treeData.find(tree => tree.x === selected.x && tree.y === selected.z)
    : null;

  const hasTreeData = selected ? Boolean(selectedTree) : false;

  // 체력 상태에 따른 색상
  const getHealthColor = (health: number, maxHealth: number) => {
    const percentage = (health / maxHealth) * 100;
    if (percentage >= 70) return "#10B981";
    if (percentage >= 40) return "#F59E0B";
    return "#EF4444";
  };

  // 동적 스타일 헬퍼 함수들
  // Hitbox toggle removed
  
  const getPlantButtonStyle = () => [
    s.modalBtn,
    s.modalButtonFlex,
    actionLoading ? s.modalBtnDisabled : s.modalBtnPlant
  ];
  
  const getWaterButtonStyle = () => [
    s.modalBtn,
    s.modalButtonFlex,
    actionLoading ? s.modalBtnDisabled : s.modalBtnWater
  ];

  // Load assets (all categories) when needed
  const loadAssetsForPlanting = useCallback(async () => {
    try {
      setAssetsLoading(true);
      const all = await listAssets();
      // Include all active assets; backend may flag inactive ones.
      const active = all.filter(a => a.active !== false);
      setAssets(active);
    } catch (error) {
      console.error('Failed to load assets:', error);
    } finally {
      setAssetsLoading(false);
    }
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient
        colors={["#87CEEB", "#E0F7FA"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={s.container}
      >
      {/* Cloud layer (non-interactive) */}
      <Image
        source={require('../../assets/home/cloud/cloud1.png')}
        pointerEvents="none"
        resizeMode="contain"
        style={{ position: 'absolute', top: 36, left: -24, width: 240, height: 130, opacity: 0.55 }}
      />
      <Image
        source={require('../../assets/home/cloud/cloud2.png')}
        pointerEvents="none"
        resizeMode="contain"
        style={{ position: 'absolute', top: 120, right: -28, width: 280, height: 150, opacity: 0.48 }}
      />
      <InfoBar
        points={loading ? "로딩 중..." : points}
        growth={loading ? "0" : String(growth)}
      />
      <Coco
        showTip={showCocoTip}
        onToggle={() => setShowCocoTip((v) => !v)}
      />

      <PinchGestureHandler onGestureEvent={onPinchEvent} onHandlerStateChange={onPinchStateChange}>
        <PanGestureHandler onGestureEvent={onPanEvent} onHandlerStateChange={onPanStateChange} minDist={10}>
          <View style={{ flex: 1 }} onLayout={onLayout}>
            <View style={{ flex: 1, transform: [{ translateX: pan.x }, { translateY: pan.y }] }}>
              <Board
                cells={cells}
                markers={markers}
                layoutW={layout.w}
                layoutH={layout.h}
                zoom={zoom}
                onCellPress={handleCellPress}
                selectedCell={selected}
                forestInfo={forestInfo}
                onDeadTreePress={handleDeadTreePress}
                onExpandableAreaPress={handleExpandableAreaPress}
              />
            </View>
          </View>
        </PanGestureHandler>
      </PinchGestureHandler>

      {/* Zoom controls (+ / -) */}
      <View
        style={{
          position: "absolute",
          right: 16,
          bottom: 72,
          gap: 8,
        }}
      >
        <Pressable
          onPress={incZoom}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: "#374151",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>+</Text>
        </Pressable>
        <Pressable
          onPress={decZoom}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: "#6B7280",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>-</Text>
        </Pressable>
      </View>

      {/** Hitbox toggle UI removed */}

      {/* 기존 셀 정보 모달 */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={s.modalBackdrop}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>땅 정보</Text>
            {/* <Text style={s.modalText}>
              좌표: x = {selected?.x}, z = {selected?.z}
            </Text> */}
            
            {hasTreeData ? (
              <View style={s.treeInfoSection}>
                <Text style={[s.modalHint, s.treeInfoTitle]}>
                  🌳 나무 정보
                </Text>
                <View style={s.treeInfoCard}>
                  <Text style={s.treeInfoText}>
                    <Text style={s.treeInfoLabel}>체력: </Text>
                    <Text style={[
                      s.treeHealthText,
                      { color: getHealthColor(selectedTree!.health, selectedTree!.maxHealth) }
                    ]}>
                      {selectedTree!.health}/{selectedTree!.maxHealth}
                    </Text>
                    <Text style={s.treeInfoSubtext}>
                      ({Math.round((selectedTree!.health / selectedTree!.maxHealth) * 100)}%)
                    </Text>
                  </Text>
                  <Text style={s.treeInfoText}>
                    <Text style={s.treeInfoLabel}>성장 단계: </Text>
                    <Text style={s.treeStageText}>{selectedTree!.growthStage}</Text>
                  </Text>
                  <Text style={s.treeInfoText}>
                    <Text style={s.treeInfoLabel}>오늘 물준 횟수: </Text>
                    <Text style={s.treeWaterText}>{selectedTree!.waterCountToday}회</Text>
                  </Text>
                  {selectedTree!.lastWateredDate && (
                    <Text style={s.treeInfoText}>
                      <Text style={s.treeInfoLabel}>마지막 물준 날: </Text>
                      <Text style={s.treeInfoSubtext}>{selectedTree!.lastWateredDate}</Text>
                    </Text>
                  )}
                  {selectedTree!.isDead && (
                    <Text style={s.treeDeadText}>
                      💀 나무가 죽었습니다
                    </Text>
                  )}
                </View>
              </View>
            ) : (
              <Text style={s.modalHint}></Text>
            )}
            
            {!hasTreeData && (
              <View>
                <Text style={s.modalHint}>에셋 선택</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                  <Pressable
                    onPress={() => { setInstallTab('PLANT'); setSelectedAssetId(null); }}
                    style={{
                      flex: 1,
                      backgroundColor: installTab === 'PLANT' ? '#16A34A' : '#374151',
                      paddingVertical: 8,
                      borderRadius: 8,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '700' }}>식물</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => { setInstallTab('DECO'); setSelectedAssetId(null); }}
                    style={{
                      flex: 1,
                      backgroundColor: installTab === 'DECO' ? '#0EA5E9' : '#374151',
                      paddingVertical: 8,
                      borderRadius: 8,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '700' }}>구조물</Text>
                  </Pressable>
                </View>
                <ScrollView style={{ marginTop: 8, maxHeight: 260 }}>
                <View style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between', // ✅ 왼쪽 쏠림 방지
                  paddingHorizontal: 8,            // 좌우 여백
                }}>
                  {!assetsLoading && assets
                    .filter(a => installTab === 'PLANT' ? PLANT_CATEGORY_IDS.includes(a.categoryId) : !PLANT_CATEGORY_IDS.includes(a.categoryId))
                    .map((a) => {
                      const sprite = getSpriteByKey(a.spriteKey || undefined);
                      const selected = selectedAssetId === a.id;
                      return (
                        <Pressable
                          key={a.id}
                          onPress={() => setSelectedAssetId(a.id)}
                          style={{
                            width: '48%',          // ✅ 2열 균등
                            height: 100,
                            borderRadius: 10,
                            borderWidth: 2,
                            borderColor: selected ? '#2563EB' : '#CBD5E1',
                            backgroundColor: selected ? '#DBEAFE' : '#F8FAFC',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 8,       // 아래 간격만
                            padding: 6,
                          }}
                        >
                          {sprite ? (
                            <Image source={sprite} style={{ width: 60, height: 60, resizeMode: 'contain' }} />
                          ) : (
                            <Text style={{ fontWeight: '700', color: '#0F172A', textAlign: 'center' }}>{a.name}</Text>
                          )}
                          <Text style={{ color: '#334155', marginTop: 4, fontSize: 12 }}>
                            {(a.pricePoints ?? 0).toLocaleString()} P
                          </Text>
                        </Pressable>
                      );
                    })}
                </View>
              </ScrollView>
              </View>
            )}

            <View style={s.modalButtonRow}>
              {!hasTreeData && installTab === 'PLANT' && (
                <Pressable
                  style={getPlantButtonStyle()}
                  onPress={handlePlantTree}
                  disabled={actionLoading}
                >
                  <Text style={s.modalBtnText}>
                    {actionLoading ? "심는중..." : "나무 심기"}
                  </Text>
                </Pressable>
              )}
              
              {hasTreeData && selectedTree && !selectedTree.isDead && (
                <Pressable
                  style={getWaterButtonStyle()}
                  onPress={handleWaterTree}
                  disabled={actionLoading}
                >
                  <Text style={s.modalBtnText}>
                    {actionLoading ? "물주는중..." : "💧 물주기"}
                  </Text>
                </Pressable>
              )}
              
              {!hasTreeData && installTab === 'DECO' && (
                <Pressable
                  style={[s.modalBtn, s.modalButtonFlex, actionLoading ? s.modalBtnDisabled : { backgroundColor: '#0EA5E9' }]}
                  onPress={handlePlaceDecoration}
                  disabled={actionLoading}
                >
                  <Text style={s.modalBtnText}>
                    {actionLoading ? "설치중..." : "구조물 설치"}
                  </Text>
                </Pressable>
              )}

              {hasTreeData && selectedTree && selectedTree.isDead && (
                <Pressable
                  style={[s.modalBtn, s.modalButtonFlex, { backgroundColor: "#DC2626" }]}
                  onPress={() => {
                    setModalVisible(false);
                    handleDeadTreePress(selectedTree.treeId);
                  }}
                  disabled={actionLoading}
                >
                  <Text style={s.modalBtnText}>
                    💀 죽은 나무 제거
                  </Text>
                </Pressable>
              )}
              
              <Pressable
                style={[s.modalBtn, s.modalButtonFlex, s.modalBtnClose]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={s.modalBtnText}>닫기</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* 숲 확장 모달 */}
      <ExpandForestModal
        visible={expandModalVisible}
        onClose={() => setExpandModalVisible(false)}
        onConfirm={handleExpandForest}
        currentPoints={pointsNumber}
        loading={expandLoading}
      />
    </LinearGradient>
    </SafeAreaView>
  );
}
