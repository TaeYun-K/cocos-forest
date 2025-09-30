import React, { useState } from 'react';
import { View, Text, Modal, Pressable, ScrollView, Image, Alert } from 'react-native';
import { getSpriteByKey } from '../../assets/spriteMap';
import { homeStyles as s } from '../../styles/homeStyles';
import type { Cell } from '../../types/forest';
import type { AssetDto } from '../../api/home';

interface CellInfoModalProps {
  visible: boolean;
  onClose: () => void;
  selectedCell: Cell | null;
  hasTreeData: boolean;
  selectedTree: {
    treeId: number;
    health: number;
    maxHealth: number;
    growthStage: string;
    isDead: boolean;
    waterCountToday: number;
    lastWateredDate: string | null;
  } | null;
  assets: AssetDto[];
  assetsLoading: boolean;
  selectedAssetId: number | null;
  installTab: 'PLANT' | 'DECO';
  actionLoading: boolean;
  onInstallTabChange: (tab: 'PLANT' | 'DECO') => void;
  onAssetSelect: (assetId: number) => void;
  onPlantTree: () => void;
  onWaterTree: () => void;
  onPlaceDecoration: () => void;
  onRemoveDeadTree: (treeId: number) => void;
}

const PLANT_CATEGORY_IDS = [1, 2];

const CellInfoModal: React.FC<CellInfoModalProps> = ({
  visible,
  onClose,
  selectedCell,
  hasTreeData,
  selectedTree,
  assets,
  assetsLoading,
  selectedAssetId,
  installTab,
  actionLoading,
  onInstallTabChange,
  onAssetSelect,
  onPlantTree,
  onWaterTree,
  onPlaceDecoration,
  onRemoveDeadTree
}) => {
  const getHealthColor = (health: number, maxHealth: number) => {
    const percentage = (health / maxHealth) * 100;
    if (percentage >= 70) return "#10B981";
    if (percentage >= 40) return "#F59E0B";
    return "#EF4444";
  };

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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={s.modalBackdrop}>
        <View style={s.modalCard}>
          <Text style={s.modalTitle}>땅 정보</Text>

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
                  onPress={() => onInstallTabChange('PLANT')}
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
                  onPress={() => onInstallTabChange('DECO')}
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
                  justifyContent: 'space-between',
                  paddingHorizontal: 8,
                }}>
                  {!assetsLoading && assets
                    .filter(a => installTab === 'PLANT' ? PLANT_CATEGORY_IDS.includes(a.categoryId) : !PLANT_CATEGORY_IDS.includes(a.categoryId))
                    .map((a) => {
                      const sprite = getSpriteByKey(a.spriteKey || undefined);
                      const selected = selectedAssetId === a.id;
                      return (
                        <Pressable
                          key={a.id}
                          onPress={() => onAssetSelect(a.id)}
                          style={{
                            width: '48%',
                            height: 100,
                            borderRadius: 10,
                            borderWidth: 2,
                            borderColor: selected ? '#2563EB' : '#CBD5E1',
                            backgroundColor: selected ? '#DBEAFE' : '#F8FAFC',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 8,
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
                onPress={onPlantTree}
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
                onPress={onWaterTree}
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
                onPress={onPlaceDecoration}
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
                  onClose();
                  onRemoveDeadTree(selectedTree.treeId);
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
              onPress={onClose}
            >
              <Text style={s.modalBtnText}>닫기</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CellInfoModal;