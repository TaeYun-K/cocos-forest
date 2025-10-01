import React, { useState, useCallback, useEffect, useRef } from "react";
import { View, Text, Pressable, LayoutChangeEvent, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { PinchGestureHandler, PanGestureHandler, State as GestureState } from "react-native-gesture-handler";
import InfoBar from "../components/homescreen/InfoBar";
import Coco from "../components/homescreen/Coco";
import Board from "../components/homescreen/Forest";
import ExpandForestModal from "../components/homescreen/ExpandForestModal";
import CellInfoModal from "../components/homescreen/CellInfoModal";
import { homeStyles as s } from "../styles/homeStyles";
import { colors } from "../styles/commonStyles";
import { computeTopMargin, computeBoardHeight, computeBoardWidth } from "../utils/iso";
import { useCells, projectMarkers, useMarkerSet } from "../hooks/useForestData";
import type { Marker } from "../types/forest";
import { useHomeScreen } from "../hooks/useHomeScreen";
import { LinearGradient } from "expo-linear-gradient";

export default function HomeScreen() {
  // 커스텀 훅 사용
  const {
    forestInfo,
    points,
    pointsNumber,
    growth,
    loading,
    actionLoading,
    expandLoading,
    originalMarkers,
    treeData,
    selected,
    modalVisible,
    expandModalVisible,
    showCocoTip,
    assets,
    assetsLoading,
    selectedAssetId,
    installTab,
    setModalVisible,
    setExpandModalVisible,
    setShowCocoTip,
    setSelectedAssetId,
    setInstallTab,
    loadForestData,
    handleCellPress,
    handleExpandableAreaPress,
    handleExpandForest,
    handlePlantTree,
    handleWaterTree,
    handlePlaceDecoration,
    handleDeadTreePress,
  } = useHomeScreen();

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

  // 홈탭을 누를 때마다 데이터 새로고침
  useFocusEffect(
    useCallback(() => {
      console.log("🏠 홈탭 포커스 - 데이터 새로고침");
      loadForestData();
    }, [loadForestData])
  );

  // 레이아웃 변경 시 마커 위치 재투영
  useEffect(() => {
    if (originalMarkers.length > 0 && centerX > 0 && topMargin > 0) {
      setMarkers(projectMarkers(originalMarkers, centerX, topMargin));
    }
  }, [originalMarkers, centerX, topMargin]);

  // 선택된 셀의 나무 정보 찾기
  const selectedTree = selected
    ? treeData.find(tree => tree.x === selected.x && tree.y === selected.z)
    : null;

  const hasTreeData = selected ? Boolean(selectedTree) : false;

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
        onToggle={() => setShowCocoTip(!showCocoTip)}
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
            backgroundColor: colors.gray700,
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

      {/* 셀 정보 모달 */}
      <CellInfoModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        selectedCell={selected}
        hasTreeData={hasTreeData}
        selectedTree={selectedTree}
        assets={assets}
        assetsLoading={assetsLoading}
        selectedAssetId={selectedAssetId}
        installTab={installTab}
        actionLoading={actionLoading}
        onInstallTabChange={(tab) => {
          setInstallTab(tab);
          setSelectedAssetId(null);
        }}
        onAssetSelect={setSelectedAssetId}
        onPlantTree={handlePlantTree}
        onWaterTree={() => selectedTree && handleWaterTree(selectedTree.treeId)}
        onPlaceDecoration={handlePlaceDecoration}
        onRemoveDeadTree={handleDeadTreePress}
      />

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
