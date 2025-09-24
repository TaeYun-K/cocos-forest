import { axiosInstance } from './axios';
import { API_CONFIG, getApiUrl } from '../config/apiConfig';
import { TodayChallengesResponse, ChallengeInstance, ClaimRewardResponse } from '../types/challenge';

export interface ChallengeProgressRequest {
  challengeType: 'attendance' | 'steps' | 'transport' | 'tumbler';
  progress: number;
  maxProgress: number;
  additionalData?: {
    steps?: number;
    transportUsed?: boolean;
    tumblerVerified?: boolean;
  };
}

export interface ChallengeProgressResponse {
  success: boolean;
  challengeId: string;
  challengeType: string;
  progress: number;
  maxProgress: number;
  isCompleted: boolean;
  pointsEarned?: number;
  message: string;
}

export interface ChallengeStatusResponse {
  challenges: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    icon: string;
    difficulty: string;
    points: number;
    status: string;
    progress: number;
    maxProgress: number;
    completedAt?: string;
    rewardClaimed: boolean;
  }>;
  totalPoints: number;
  completedChallenges: number;
}

export interface RewardClaimRequest {
  challengeId: string;
  challengeType: string;
}

export interface RewardClaimResponse {
  success: boolean;
  pointsEarned: number;
  totalPoints: number;
  message: string;
}

export const challengeApi = {
  // 오늘의 챌린지 조회 (GET /api/challenges/today)
  getTodayChallenges: async (): Promise<TodayChallengesResponse> => {
    const response = await axiosInstance.get(getApiUrl(API_CONFIG.CHALLENGE_ENDPOINTS.TODAY));
    return response.data;
  },

  // 챌린지 보상 수령 (POST /api/challenges/{userChallengeId}/claim)
  claimChallengeReward: async (userChallengeId: string): Promise<ClaimRewardResponse> => {
    const response = await axiosInstance.post(
      getApiUrl(`${API_CONFIG.CHALLENGE_ENDPOINTS.CLAIM}/${userChallengeId}/claim`)
    );
    return response.data;
  },

  // 챌린지 진행률 업데이트
  updateProgress: async (data: ChallengeProgressRequest): Promise<ChallengeProgressResponse> => {
    const response = await axiosInstance.post(
      getApiUrl(API_CONFIG.CHALLENGE_ENDPOINTS.STATUS),
      data
    );
    return response.data;
  },

  // 챌린지 상태 조회
  getChallengeStatus: async (): Promise<ChallengeStatusResponse> => {
    const response = await axiosInstance.get(getApiUrl(API_CONFIG.CHALLENGE_ENDPOINTS.STATUS));
    return response.data;
  },

  // 출석체크
  checkAttendance: async (): Promise<ChallengeProgressResponse> => {
    try {
      const response = await axiosInstance.post(getApiUrl(API_CONFIG.CHALLENGE_ENDPOINTS.ATTENDANCE));
      
      if (response.data.isSuccess && response.data.result) {
        const result = response.data.result;
        return {
          success: result.success || true,
          challengeId: 'attendance',
          challengeType: 'attendance',
          progress: result.progress || 1,
          maxProgress: result.maxProgress || 1,
          isCompleted: result.isCompleted || result.awarded || true,
          pointsEarned: result.points || result.pointsEarned || 100,
          message: result.message || result.reason || '출석체크가 완료되었습니다.',
        };
      } else if (response.data.success === false) {
        return {
          success: false,
          challengeId: 'attendance',
          challengeType: 'attendance',
          progress: response.data.progress || 0,
          maxProgress: response.data.maxProgress || 1,
          isCompleted: response.data.isCompleted || false,
          pointsEarned: response.data.pointsEarned || 0,
          message: response.data.message || '출석체크에 실패했습니다.',
        };
      } else {
        return {
          success: false,
          challengeId: 'attendance',
          challengeType: 'attendance',
          progress: 0,
          maxProgress: 1,
          isCompleted: false,
          pointsEarned: 0,
          message: response.data.message || '출석체크에 실패했습니다.',
        };
      }
    } catch (error: any) {
      let errorMessage = '출석체크 중 오류가 발생했습니다.';
      
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        errorMessage = '네트워크 연결을 확인해주세요. 서버에 연결할 수 없습니다.';
      } else if (error.response?.status === 404) {
        errorMessage = '출석체크 API를 찾을 수 없습니다. 서버 설정을 확인해주세요.';
      } else if (error.response?.status === 500) {
        errorMessage = '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      } else if (error.response?.status === 401) {
        errorMessage = '인증이 필요합니다. 로그인을 다시 해주세요.';
      } else if (error.response?.status >= 400) {
        errorMessage = `서버 오류 (${error.response.status}): ${error.response.data?.message || '알 수 없는 오류'}`;
      }
      
      return {
        success: false,
        challengeId: 'attendance',
        challengeType: 'attendance',
        progress: 0,
        maxProgress: 1,
        isCompleted: false,
        pointsEarned: 0,
        message: errorMessage,
      };
    }
  },

  // 걸음수 업데이트
  updateSteps: async (steps: number): Promise<ChallengeProgressResponse> => {
    try {
      const response = await axiosInstance.post(getApiUrl(API_CONFIG.CHALLENGE_ENDPOINTS.STEPS), { steps });
      
      if (response.data.isSuccess && response.data.result) {
        const result = response.data.result;
        const isCompleted = result.steps >= 10000;
        
        return {
          success: true,
          challengeId: 'steps',
          challengeType: 'steps',
          progress: result.steps,
          maxProgress: 10000,
          isCompleted,
          pointsEarned: isCompleted ? 200 : 0,
          message: isCompleted ? '만보기 챌린지가 완료되었습니다!' : '걸음수가 업데이트되었습니다.',
        };
      } else {
        return {
          success: false,
          challengeId: 'steps',
          challengeType: 'steps',
          progress: steps,
          maxProgress: 10000,
          isCompleted: false,
          pointsEarned: 0,
          message: response.data.message || '걸음수 업데이트에 실패했습니다.',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        challengeId: 'steps',
        challengeType: 'steps',
        progress: steps,
        maxProgress: 10000,
        isCompleted: false,
        pointsEarned: 0,
        message: error.response?.data?.message || '걸음수 업데이트 중 오류가 발생했습니다.',
      };
    }
  },

  // 대중교통 이용 확인 (결제내역 API 연동)
  checkTransport: async (): Promise<ChallengeProgressResponse> => {
    try {
      const response = await axiosInstance.post(getApiUrl(API_CONFIG.CHALLENGE_ENDPOINTS.TRANSPORT));
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        challengeId: 'transport',
        challengeType: 'transport',
        progress: 0,
        maxProgress: 1,
        isCompleted: false,
        pointsEarned: 0,
        message: error.response?.data?.message || '대중교통 이용 확인 중 오류가 발생했습니다.',
      };
    }
  },

  // 텀블러 인증
  verifyTumbler: async (imageData?: string): Promise<ChallengeProgressResponse> => {
    try {
      const response = await axiosInstance.post(getApiUrl(API_CONFIG.CHALLENGE_ENDPOINTS.TUMBLER), {
        imageData
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        challengeId: 'tumbler',
        challengeType: 'tumbler',
        progress: 0,
        maxProgress: 1,
        isCompleted: false,
        pointsEarned: 0,
        message: error.response?.data?.message || '텀블러 인증 중 오류가 발생했습니다.',
      };
    }
  },

  // 보상 수령
  claimReward: async (data: RewardClaimRequest): Promise<RewardClaimResponse> => {
    try {
      const response = await axiosInstance.post(getApiUrl(API_CONFIG.CHALLENGE_ENDPOINTS.REWARD), data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        pointsEarned: 0,
        totalPoints: 0,
        message: error.response?.data?.message || '보상 수령 중 오류가 발생했습니다.',
      };
    }
  },

  // 챌린지 완료 처리
  completeChallenge: async (userChallengeId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await axiosInstance.post(
        getApiUrl(`${API_CONFIG.CHALLENGE_ENDPOINTS.COMPLETE}/${userChallengeId}/complete`)
      );
      
      return {
        success: response.data.isSuccess || response.data.success || true,
        message: response.data.message || '챌린지가 완료되었습니다.',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || '챌린지 완료 처리 중 오류가 발생했습니다.',
      };
    }
  },

  // 일일 챌린지 리셋 (새벽에 자동 실행)
  resetDailyChallenges: async (): Promise<{ success: boolean }> => {
    try {
      const response = await axiosInstance.post(getApiUrl(API_CONFIG.CHALLENGE_ENDPOINTS.RESET));
      return { success: response.data.success || true };
    } catch (error: any) {
      return { success: false };
    }
  },

  // 서버 헬스체크
  healthCheck: async (): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await axiosInstance.get('/api/health');
      return { 
        success: true, 
        message: '서버가 정상적으로 작동 중입니다.' 
      };
    } catch (error: any) {
      return { 
        success: false, 
        message: `서버 연결 실패: ${error.response?.status || 'NETWORK_ERROR'}` 
      };
    }
  },
};