import { axiosInstance } from './axios';
import { API_CONFIG, getApiUrl } from '../config/apiConfig';
import { TodayChallengesResponse, ChallengeInstance, ClaimRewardResponse } from '../types/challenge';

// 챌린지 관련 API 타입 정의
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

// 챌린지 API 서비스
export const challengeApi = {
  // 오늘의 챌린지 조회 (GET /api/challenges/today)
  getTodayChallenges: async (): Promise<TodayChallengesResponse> => {
    if (API_CONFIG.USE_MOCK_API) {
      // 가상 API - 실제 백엔드 구현 시 교체
      console.log('📤 오늘의 챌린지 조회 API 호출 (가상)');
      return {
        httpStatus: "200 OK",
        isSuccess: true,
        message: "오늘의 챌린지를 성공적으로 조회했습니다.",
        code: 0,
        result: {
          date: new Date().toISOString().split('T')[0],
          fresh: true,
          lastSyncedAt: new Date().toISOString(),
          challenges: [
            {
              instanceId: "attendance-001",
              challengeId: "attendance",
              title: "출석체크",
              rule: "매일 앱에 접속하여 출석체크를 완료하세요",
              rewardPoints: 100,
              status: "pending",
              claimable: false,
              metrics: {},
              additionalProp1: {},
              additionalProp2: {},
              additionalProp3: {},
              awarded: false,
              awardedAt: "",
              message: "출석체크를 완료하세요"
            },
            {
              instanceId: "steps-001",
              challengeId: "steps",
              title: "만보기",
              rule: "하루 10,000보를 걸어보세요",
              rewardPoints: 200,
              status: "pending",
              claimable: false,
              metrics: {},
              additionalProp1: {},
              additionalProp2: {},
              additionalProp3: {},
              awarded: false,
              awardedAt: "",
              message: "10,000보를 걸어보세요"
            },
            {
              instanceId: "transport-001",
              challengeId: "transport",
              title: "대중교통이용하기",
              rule: "대중교통을 이용하여 환경을 보호하세요",
              rewardPoints: 300,
              status: "pending",
              claimable: false,
              metrics: {},
              additionalProp1: {},
              additionalProp2: {},
              additionalProp3: {},
              awarded: false,
              awardedAt: "",
              message: "대중교통을 이용해보세요"
            },
            {
              instanceId: "tumbler-001",
              challengeId: "tumbler",
              title: "텀블러 이용하기",
              rule: "카페에서 텀블러를 사용하고 인증하세요",
              rewardPoints: 400,
              status: "pending",
              claimable: false,
              metrics: {},
              additionalProp1: {},
              additionalProp2: {},
              additionalProp3: {},
              awarded: false,
              awardedAt: "",
              message: "텀블러를 사용하고 인증하세요"
            }
          ]
        }
      };
    } else {
      // 실제 백엔드 API 호출
      const response = await axiosInstance.get(getApiUrl(API_CONFIG.CHALLENGE_ENDPOINTS.TODAY));
      return response.data;
    }
  },

  // 챌린지 보상 수령 (POST /api/challenges/{userChallengeId}/claim)
  claimChallengeReward: async (userChallengeId: string): Promise<ClaimRewardResponse> => {
    if (API_CONFIG.USE_MOCK_API) {
      // 가상 API - 실제 백엔드 구현 시 교체
      console.log('📤 챌린지 보상 수령 API 호출 (가상):', userChallengeId);
      return {
        httpStatus: "200 OK",
        isSuccess: true,
        message: "보상을 성공적으로 수령했습니다.",
        code: 0,
        result: "보상 수령 완료"
      };
    } else {
      // 실제 백엔드 API 호출
      const response = await axiosInstance.post(
        getApiUrl(`${API_CONFIG.CHALLENGE_ENDPOINTS.CLAIM}/${userChallengeId}/claim`)
      );
      return response.data;
    }
  },
  // 챌린지 진행률 업데이트
  updateProgress: async (data: ChallengeProgressRequest): Promise<ChallengeProgressResponse> => {
    // 가상 API - 실제 백엔드 구현 시 교체
    console.log('📤 챌린지 진행률 업데이트:', data);
    return {
      success: true,
      challengeId: data.challengeType,
      challengeType: data.challengeType,
      progress: data.progress,
      maxProgress: data.maxProgress,
      isCompleted: data.progress >= data.maxProgress,
      pointsEarned: data.progress >= data.maxProgress ? 100 : 0,
      message: '진행률이 업데이트되었습니다.',
    };
  },

  // 챌린지 상태 조회
  getChallengeStatus: async (): Promise<ChallengeStatusResponse> => {
    // 가상 API - 실제 백엔드 구현 시 교체
    console.log('📤 챌린지 상태 조회');
    return {
      success: true,
      challenges: [
        {
          id: 'attendance',
          type: 'attendance',
          title: '출석체크',
          description: '매일 앱에 접속하여 출석체크를 완료하세요',
          icon: '📅',
          difficulty: 'easy',
          points: 100,
          status: 'pending',
          progress: 0,
          maxProgress: 1,
          rewardClaimed: false,
        },
        {
          id: 'steps',
          type: 'steps',
          title: '만보기',
          description: '하루 10,000보를 걸어보세요',
          icon: '🚶‍♂️',
          difficulty: 'hard',
          points: 200,
          status: 'pending',
          progress: 0,
          maxProgress: 10000,
          rewardClaimed: false,
        },
        {
          id: 'transport',
          type: 'transport',
          title: '대중교통이용하기',
          description: '대중교통을 이용하여 환경을 보호하세요',
          icon: '🚌',
          difficulty: 'medium',
          points: 300,
          status: 'pending',
          progress: 0,
          maxProgress: 1,
          rewardClaimed: false,
        },
        {
          id: 'tumbler',
          type: 'tumbler',
          title: '텀블러 이용하기',
          description: '카페에서 텀블러를 사용하고 인증하세요',
          icon: '☕',
          difficulty: 'medium',
          points: 400,
          status: 'pending',
          progress: 0,
          maxProgress: 1,
          rewardClaimed: false,
        },
      ],
      totalPoints: 1000,
      completedChallenges: 0,
    };
  },

  // 출석체크
  checkAttendance: async (): Promise<ChallengeProgressResponse> => {
    if (API_CONFIG.USE_MOCK_API) {
      // 가상 API - 실제 백엔드 구현 시 교체
      console.log('📤 출석체크 API 호출 (가상)');
      return {
        success: true,
        challengeId: 'attendance',
        challengeType: 'attendance',
        progress: 1,
        maxProgress: 1,
        isCompleted: true,
        pointsEarned: 100,
        message: '출석체크가 완료되었습니다.',
      };
    } else {
      // 실제 백엔드 API 호출
      const response = await axiosInstance.post(getApiUrl(API_CONFIG.CHALLENGE_ENDPOINTS.ATTENDANCE));
      return response.data;
    }
  },

  // 걸음수 업데이트
  updateSteps: async (steps: number): Promise<ChallengeProgressResponse> => {
    if (API_CONFIG.USE_MOCK_API) {
      // 가상 API - 실제 백엔드 구현 시 교체
      console.log('📤 걸음수 업데이트 API 호출 (가상):', steps);
      const isCompleted = steps >= 10000;
      return {
        success: true,
        challengeId: 'steps',
        challengeType: 'steps',
        progress: steps,
        maxProgress: 10000,
        isCompleted,
        pointsEarned: isCompleted ? 200 : 0,
        message: isCompleted ? '만보기 챌린지가 완료되었습니다!' : '걸음수가 업데이트되었습니다.',
      };
    } else {
      // 실제 백엔드 API 호출
      const response = await axiosInstance.post(getApiUrl(API_CONFIG.CHALLENGE_ENDPOINTS.STEPS), { steps });
      return response.data;
    }
  },

  // 대중교통 이용 확인 (결제내역 API 연동)
  checkTransport: async (): Promise<ChallengeProgressResponse> => {
    // 가상 API - 실제 백엔드 구현 시 교체
    console.log('📤 대중교통 이용 확인 API 호출');
    return {
      success: true,
      challengeId: 'transport',
      challengeType: 'transport',
      progress: 0,
      maxProgress: 1,
      isCompleted: false,
      pointsEarned: 0,
      message: '대중교통 이용이 확인되지 않았습니다.',
    };
  },

  // 텀블러 인증
  verifyTumbler: async (imageData?: string): Promise<ChallengeProgressResponse> => {
    // 가상 API - 실제 백엔드 구현 시 교체
    console.log('📤 텀블러 인증 API 호출');
    return {
      success: true,
      challengeId: 'tumbler',
      challengeType: 'tumbler',
      progress: 1,
      maxProgress: 1,
      isCompleted: true,
      pointsEarned: 400,
      message: '텀블러 인증이 완료되었습니다.',
    };
  },

  // 보상 수령
  claimReward: async (data: RewardClaimRequest): Promise<RewardClaimResponse> => {
    // 가상 API - 실제 백엔드 구현 시 교체
    console.log('📤 보상 수령 API 호출:', data);
    return {
      success: true,
      pointsEarned: 100,
      totalPoints: 1000,
      message: '보상이 수령되었습니다.',
    };
  },

  // 일일 챌린지 리셋 (새벽에 자동 실행)
  resetDailyChallenges: async (): Promise<{ success: boolean }> => {
    // 가상 API - 실제 백엔드 구현 시 교체
    console.log('📤 일일 챌린지 리셋 API 호출');
    return { success: true };
  },
};
