import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import {
  fetchForestInfo,
  fetchPoints,
  plantTree,
  waterTree,
  removeDeadTree,
  expandForest,
  listAssets,
  placeDecoration,
  removeDecoration,
  type AssetDto
} from '../api/home';
import type { ForestInfoDto } from '../types/forest';
import type { Cell } from '../types/forest';

export const useHomeScreen = () => {
  // 숲 정보 상태
  const [forestInfo, setForestInfo] = useState<ForestInfoDto | null>(null);
  const [points, setPoints] = useState("0");
  const [pointsNumber, setPointsNumber] = useState(0);
  const [growth, setGrowth] = useState<string | number>(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [expandLoading, setExpandLoading] = useState(false);

  // 나무 데이터
  const [originalMarkers, setOriginalMarkers] = useState<Array<{ x: number; z: number; growthStage: string }>>([]);
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

  // UI 상태
  const [selected, setSelected] = useState<Cell | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [expandModalVisible, setExpandModalVisible] = useState(false);
  const [showCocoTip, setShowCocoTip] = useState(false);

  // Asset 상태
  const [assets, setAssets] = useState<AssetDto[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  const [installTab, setInstallTab] = useState<'PLANT' | 'DECO'>('PLANT');

  // 숲 데이터 로드
  const loadForestData = useCallback(async () => {
    try {
      setLoading(true);
      console.log("📥 숲 데이터 로드 시작...");

      const [forestInfoData, pointsData] = await Promise.all([
        fetchForestInfo(),
        fetchPoints(),
      ]);

      console.log("🌳 받아온 숲 정보:", forestInfoData);
      console.log("🌳 나무 개수:", forestInfoData.trees.length);
      console.log("🌳 숲 크기:", forestInfoData.size);

      setForestInfo(forestInfoData);

      const treeMarkers = forestInfoData.trees.map((tree) => ({
        x: tree.x,
        z: tree.y,
        growthStage: tree.growthStage,
        assetId: tree.assetId,
      }));
      setOriginalMarkers(treeMarkers);
      setTreeData(forestInfoData.trees);

      const aliveTreeCount = forestInfoData.aliveTreeCount || 0;
      const totalTreeCount = forestInfoData.trees.length || 0;
      const treeCountDisplay = `${aliveTreeCount}/${totalTreeCount}`;
      setGrowth(treeCountDisplay);

      setPointsNumber(pointsData);
      setPoints(pointsData.toLocaleString() + " P");

      console.log("✅ 숲 데이터 로드 완료");
    } catch (error) {
      console.error("❌ Failed to load forest data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Asset 로드
  const loadAssetsForPlanting = useCallback(async () => {
    try {
      setAssetsLoading(true);
      const all = await listAssets();
      const active = all.filter(a => a.active !== false);
      setAssets(active);
    } catch (error) {
      console.error('Failed to load assets:', error);
    } finally {
      setAssetsLoading(false);
    }
  }, []);

  // 셀 클릭 핸들러
  const handleCellPress = useCallback((cell: Cell) => {
    setSelected(cell);

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
      return;
    }

    setModalVisible(true);
    const exists = treeData.find(tree => tree.x === cell.x && tree.y === cell.z);
    if (!exists) {
      setSelectedAssetId(null);
      if (assets.length === 0) {
        loadAssetsForPlanting();
      }
    }
  }, [forestInfo?.decorations, treeData, assets.length, loadAssetsForPlanting, loadForestData]);

  // 확장 가능 영역 클릭
  const handleExpandableAreaPress = useCallback(() => {
    setExpandModalVisible(true);
  }, []);

  // 숲 확장
  const handleExpandForest = async () => {
    try {
      setExpandLoading(true);

      console.log("🌲 숲 확장 시작...");
      const expandedForestInfo = await expandForest();

      console.log("🌲 숲 확장 성공:", expandedForestInfo);

      setForestInfo(expandedForestInfo);

      const treeMarkers = expandedForestInfo.trees.map((tree) => ({
        x: tree.x,
        z: tree.y,
        growthStage: tree.growthStage,
        assetId: tree.assetId,
      }));
      setOriginalMarkers(treeMarkers);
      setTreeData(expandedForestInfo.trees);

      const updatedPoints = await fetchPoints();
      setPointsNumber(updatedPoints);
      setPoints(updatedPoints.toLocaleString() + " P");

      setExpandModalVisible(false);

      Alert.alert("성공", "숲이 성공적으로 확장되었습니다! 🌲");

    } catch (error: any) {
      console.error("❌ 숲 확장 실패:", error);
      Alert.alert("실패", error.message || "숲 확장에 실패했습니다.");
    } finally {
      setExpandLoading(false);
    }
  };

  // 나무 심기
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

  // 물주기
  const handleWaterTree = async (treeId: number) => {
    if (actionLoading) return;

    try {
      setActionLoading(true);

      await waterTree(treeId);
      await loadForestData();
      setModalVisible(false);

    } catch (error) {
      console.error("물주기 실패:", error);
      alert("물주기에 실패했습니다. 포인트가 부족하거나 오늘 이미 충분히 물을 줬을 수 있습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  // 장식 설치
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

  // 죽은 나무 제거
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

  return {
    // State
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

    // Actions
    setSelected,
    setModalVisible,
    setExpandModalVisible,
    setShowCocoTip,
    setSelectedAssetId,
    setInstallTab,
    loadForestData,
    loadAssetsForPlanting,
    handleCellPress,
    handleExpandableAreaPress,
    handleExpandForest,
    handlePlantTree,
    handleWaterTree,
    handlePlaceDecoration,
    handleDeadTreePress,
  };
};