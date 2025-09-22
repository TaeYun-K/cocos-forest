// components/modals/ExpandForestModal.tsx
import React from "react";
import { View, Text, Modal, Pressable, ActivityIndicator } from "react-native";

interface ExpandForestModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentPoints: number;
  loading?: boolean;
}

const EXPAND_COST = 1000;

export default function ExpandForestModal({
  visible,
  onClose,
  onConfirm,
  currentPoints,
  loading = false,
}: ExpandForestModalProps) {
  const hasEnoughPoints = currentPoints >= EXPAND_COST;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>🌲 숲 확장</Text>
          
          <View style={styles.contentSection}>
            <Text style={styles.descriptionText}>
              숲을 확장하시겠습니까?
            </Text>
            <Text style={styles.detailText}>
              • 현재 크기에서 가로세로 각각 2만큼 확장됩니다
            </Text>
            <Text style={styles.detailText}>
              • 더 많은 나무를 심을 수 있습니다
            </Text>
          </View>

          <View style={styles.costSection}>
            <Text style={styles.costLabel}>소모 포인트</Text>
            <Text style={styles.costValue}>{EXPAND_COST.toLocaleString()} P</Text>
          </View>

          <View style={styles.pointsSection}>
            <Text style={styles.pointsLabel}>보유 포인트</Text>
            <Text style={[
              styles.pointsValue,
              { color: hasEnoughPoints ? "#10B981" : "#EF4444" }
            ]}>
              {currentPoints.toLocaleString()} P
            </Text>
          </View>

          {!hasEnoughPoints && (
            <View style={styles.warningSection}>
              <Text style={styles.warningText}>
                ⚠️ 포인트가 부족합니다
              </Text>
            </View>
          )}

          <View style={styles.buttonRow}>
            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </Pressable>
            
            <Pressable
              style={[
                styles.button,
                styles.confirmButton,
                (!hasEnoughPoints || loading) && styles.disabledButton
              ]}
              onPress={onConfirm}
              disabled={!hasEnoughPoints || loading}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.confirmButtonText}>확장 중...</Text>
                </View>
              ) : (
                <Text style={styles.confirmButtonText}>확장하기</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = {
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#1F2937",
  },
  contentSection: {
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 12,
    color: "#374151",
    fontWeight: "500",
  },
  detailText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
    paddingLeft: 8,
  },
  costSection: {
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  costLabel: {
    fontSize: 14,
    color: "#92400E",
    fontWeight: "500",
  },
  costValue: {
    fontSize: 16,
    color: "#92400E",
    fontWeight: "bold",
  },
  pointsSection: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pointsLabel: {
    fontSize: 14,
    color: "#4B5563",
    fontWeight: "500",
  },
  pointsValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  warningSection: {
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  warningText: {
    fontSize: 14,
    color: "#DC2626",
    textAlign: "center",
    fontWeight: "500",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#4B5563",
    fontWeight: "500",
  },
  confirmButton: {
    backgroundColor: "#10B981",
  },
  confirmButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#D1D5DB",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
};