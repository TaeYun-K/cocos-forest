// api/forest.ts
import apiClient, { mock } from "./axios";
import type { MarkerCoord } from "../types/forest";

// BaseResponse 타입 정의
interface BaseResponse<T> {
  httpStatus: string;
  isSuccess: boolean;
  message: string;
  code: number;
  result: T;
}

// 백엔드 실제 응답 구조에 맞게 수정
export type ForestInfoDto = {
  aliveTreeCount: number;
  createdAt: string;
  deadHighlightCount: number;
  forestId: number;
  pondX: number;
  pondY: number;
  size: number;
  trees: Array<{
    deadHighlight: boolean;
    growthDays: number;
    growthStage: string;
    health: number;
    isDead: boolean;
    lastWateredDate: string | null;
    maxHealth: number;
    plantedAt: string;
    treeId: number;
    waterCountToday: number;
    x: number;
    y: number;
  }>;
  updatedAt: string;
  userId: number;
};

export type PointsDto = number; // 숫자가 바로 반환됨

/* 내 숲 정보 조회 */
export async function fetchForestInfo(): Promise<ForestInfoDto> {
  try {
    const response = await apiClient.get<BaseResponse<ForestInfoDto>>("/api/forest");
    
    if (!response.data.isSuccess) {
      throw new Error(response.data.message || "숲 정보 조회에 실패했습니다.");
    }
    
    console.log("my forest info:", response.data.result);
    return response.data.result;
  } catch (error) {
    console.error("fetchForestInfo error:", error);
    throw error;
  }
}

/* 내 포인트 조회 */
export async function fetchPoints(): Promise<PointsDto> {
  try {
    const response = await apiClient.get<BaseResponse<PointsDto>>("/api/forest/points");
    
    if (!response.data.isSuccess) {
      throw new Error(response.data.message || "포인트 조회에 실패했습니다.");
    }
    
    console.log("my points:", response.data.result);
    return response.data.result;
  } catch (error) {
    console.error("fetchPoints error:", error);
    throw error;
  }
}

/* 나무 심기 */
export async function plantTree(x: number, y: number): Promise<void> {
  try {
    const response = await apiClient.post<BaseResponse<any>>("/api/forest/trees", {
      x,
      y
    });
    
    if (!response.data.isSuccess) {
      throw new Error(response.data.message || "나무 심기에 실패했습니다.");
    }
    
    console.log("나무 심기 성공:", { x, y });
  } catch (error) {
    console.error("plantTree error:", error);
    throw error;
  }
}

/* 물주기 */
export async function waterTree(treeId: number): Promise<void> {
  try {
    const response = await apiClient.post<BaseResponse<any>>(`/api/forest/trees/${treeId}/water`);
    
    if (!response.data.isSuccess) {
      throw new Error(response.data.message || "물주기에 실패했습니다.");
    }
    
    console.log("물주기 성공:", { treeId });
  } catch (error) {
    console.error("waterTree error:", error);
    throw error;
  }
}