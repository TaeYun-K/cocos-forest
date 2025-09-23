import { create } from 'zustand';
import { Challenge, ChallengeType, ChallengeStatus, ChallengeInstance, TodayChallengesResponse } from '../types/challenge';
import { challengeApi } from '../api/challenge';

interface ChallengeState {
  challenges: Challenge[];
  completedChallenges: string[];
  claimedRewards: string[];
  todayChallenges: ChallengeInstance[];
  isLoading: boolean;
  
  // Actions
  initializeChallenges: () => void;
  loadTodayChallenges: () => Promise<void>;
  updateChallengeStatus: (challengeId: string, status: ChallengeStatus) => void;
  updateChallengeProgress: (challengeId: string, progress: number) => void;
  completeChallenge: (challengeId: string) => void;
  claimReward: (challengeId: string) => void;
  claimChallengeReward: (userChallengeId: string) => Promise<boolean>;
  checkAttendance: () => void;
  updateSteps: (steps: number) => void;
  checkTransportUsage: (hasUsed: boolean) => void;
  verifyTumbler: (isVerified: boolean) => void;
}

const initialChallenges: Challenge[] = [
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
];

export const useChallengeStore = create<ChallengeState>((set, get) => ({
  challenges: initialChallenges,
  completedChallenges: [],
  claimedRewards: [],
  todayChallenges: [],
  isLoading: false,

  initializeChallenges: () => {
    set({ challenges: initialChallenges });
  },

  loadTodayChallenges: async () => {
    set({ isLoading: true });
    try {
      const response = await challengeApi.getTodayChallenges();
      if (response.isSuccess) {
        set({ todayChallenges: response.result.challenges });
        // 백엔드 데이터를 로컬 챌린지 형식으로 변환하여 업데이트
        const updatedChallenges = response.result.challenges.map((challengeInstance) => {
          const existingChallenge = get().challenges.find(c => c.id === challengeInstance.challengeId);
          if (existingChallenge) {
            return {
              ...existingChallenge,
              status: challengeInstance.status === 'completed' ? 'completed' : 
                     challengeInstance.status === 'in_progress' ? 'in_progress' : 'pending',
              points: challengeInstance.rewardPoints,
              rewardClaimed: challengeInstance.awarded,
              progress: challengeInstance.status === 'completed' ? existingChallenge.maxProgress : 0,
            };
          }
          return existingChallenge;
        }).filter(Boolean);
        
        set({ challenges: updatedChallenges });
      }
    } catch (error) {
      console.error('Failed to load today challenges:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  updateChallengeStatus: (challengeId: string, status: ChallengeStatus) => {
    set((state) => ({
      challenges: state.challenges.map((challenge) =>
        challenge.id === challengeId ? { ...challenge, status } : challenge
      ),
    }));
  },

  updateChallengeProgress: (challengeId: string, progress: number) => {
    set((state) => ({
      challenges: state.challenges.map((challenge) => {
        if (challenge.id === challengeId) {
          const newProgress = Math.min(progress, challenge.maxProgress);
          const isCompleted = newProgress >= challenge.maxProgress;
          return {
            ...challenge,
            progress: newProgress,
            status: isCompleted ? 'completed' : 'in_progress',
          };
        }
        return challenge;
      }),
    }));
  },

  completeChallenge: (challengeId: string) => {
    const now = new Date().toISOString();
    set((state) => ({
      challenges: state.challenges.map((challenge) =>
        challenge.id === challengeId
          ? { ...challenge, status: 'completed', completedAt: now }
          : challenge
      ),
      completedChallenges: [...state.completedChallenges, challengeId],
    }));
  },

  claimReward: (challengeId: string) => {
    const now = new Date().toISOString();
    set((state) => ({
      challenges: state.challenges.map((challenge) =>
        challenge.id === challengeId
          ? { ...challenge, rewardClaimed: true }
          : challenge
      ),
      claimedRewards: [...state.claimedRewards, challengeId],
    }));
  },

  claimChallengeReward: async (userChallengeId: string): Promise<boolean> => {
    try {
      const response = await challengeApi.claimChallengeReward(userChallengeId);
      if (response.isSuccess) {
        // 해당 챌린지 인스턴스의 보상 수령 상태 업데이트
        set((state) => ({
          todayChallenges: state.todayChallenges.map((challenge) =>
            challenge.instanceId === userChallengeId
              ? { ...challenge, awarded: true, awardedAt: new Date().toISOString() }
              : challenge
          ),
        }));
        
        // 로컬 챌린지 상태도 업데이트
        const challengeInstance = get().todayChallenges.find(c => c.instanceId === userChallengeId);
        if (challengeInstance) {
          get().claimReward(challengeInstance.challengeId);
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to claim challenge reward:', error);
      return false;
    }
  },

  checkAttendance: () => {
    const { updateChallengeProgress, completeChallenge } = get();
    updateChallengeProgress('attendance', 1);
    completeChallenge('attendance');
  },

  updateSteps: (steps: number) => {
    const { updateChallengeProgress, completeChallenge } = get();
    updateChallengeProgress('steps', steps);
    if (steps >= 10000) {
      completeChallenge('steps');
    }
  },

  checkTransportUsage: (hasUsed: boolean) => {
    const { updateChallengeProgress, completeChallenge } = get();
    if (hasUsed) {
      updateChallengeProgress('transport', 1);
      completeChallenge('transport');
    }
  },

  verifyTumbler: (isVerified: boolean) => {
    const { updateChallengeProgress, completeChallenge } = get();
    if (isVerified) {
      updateChallengeProgress('tumbler', 1);
      completeChallenge('tumbler');
    }
  },
}));

