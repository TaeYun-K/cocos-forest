import { StyleSheet } from "react-native";

export const homeStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#DCFCE7" },
  board: { flex: 1 },

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
  cocoImg: { width: 55, height: 55, resizeMode: "contain" },
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

  // 새로 추가된 스타일들
  treeInfoSection: {
    marginVertical: 10,
  },
  treeInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  treeInfoCard: {
    backgroundColor: '#F3F4F6',
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
  },
  treeInfoText: {
    fontSize: 14,
    marginBottom: 4,
  },
  treeInfoLabel: {
    fontWeight: 'bold',
  },
  treeHealthText: {
    fontWeight: 'bold',
  },
  treeInfoSubtext: {
    color: '#6B7280',
  },
  treeStageText: {
    color: '#374151',
  },
  treeWaterText: {
    color: '#3B82F6',
  },
  treeDeadText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: 'bold',
    marginTop: 4,
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
  },
  modalButtonFlex: {
    flex: 1,
  },
  
  // 동적 스타일을 위한 베이스 스타일들
  fabActive: {
    backgroundColor: "#10B981",
  },
  fabInactive: {
    backgroundColor: "#9CA3AF",
  },
  modalBtnPlant: {
    backgroundColor: "#10B981",
  },
  modalBtnWater: {
    backgroundColor: "#3B82F6",
  },
  modalBtnDisabled: {
    backgroundColor: "#9CA3AF",
  },
  modalBtnClose: {
    backgroundColor: "#6B7280",
  },
});