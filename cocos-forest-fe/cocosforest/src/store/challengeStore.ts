import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Challenge, ChallengeType, ChallengeStatus, ChallengeInstance, TodayChallengesResponse } from '../types/challenge';
import { challengeApi } from '../api/challenge';

interface ChallengeState {
  challenges: Challenge[];
  completedChallenges: string[];
  claimedRewards: string[];
  todayChallenges: ChallengeInstance[];
  isLoading: boolean;
  tumblerVerificationFailed: boolean; // 텀블러 인증 실패 상태
  
  // Actions
  initializeChallenges: () => void;
  loadTodayChallenges: () => Promise<void>;
  updateChallengeStatus: (challengeId: string, status: ChallengeStatus) => void;
  updateChallengeProgress: (challengeId: string, progress: number) => void;
  completeChallenge: (challengeId: string) => void;
  claimReward: (challengeId: string) => void;
  claimChallengeReward: (userChallengeId: string) => Promise<boolean>;
  checkAttendance: () => Promise<void>;
  isAttendanceCheckedToday: () => Promise<boolean>;
  updateSteps: (steps: number) => void;
  checkTransportUsage: (hasUsed: boolean) => void;
  verifyTumbler: (isVerified: boolean) => void;
  setTumblerVerificationFailed: (failed: boolean) => void;
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
  tumblerVerificationFailed: false,

  initializeChallenges: () => {
    set({ 
      challenges: initialChallenges,
      isLoading: false
    });
  },

  loadTodayChallenges: async () => {
    set({ isLoading: true });
    try {
      // 출석체크 상태와 보상 수령 상태를 먼저 확인 (로컬 우선)
      const isAttendanceChecked = await get().isAttendanceCheckedToday();
      const today = new Date().toISOString().split('T')[0];
      
      // 오늘 수령한 보상 목록 가져오기
      let claimedRewardsToday: string[] = [];
      try {
        const claimedRewardsData = JSON.parse(await AsyncStorage.getItem('claimedRewardsData') || '{}');
        claimedRewardsToday = claimedRewardsData[today] || [];
      } catch (error) {
      }
      
      // 텀블러 인증 완료 상태 가져오기
      let isTumblerVerifiedToday = false;
      try {
        const tumblerData = JSON.parse(await AsyncStorage.getItem('tumblerData') || '{}');
        isTumblerVerifiedToday = tumblerData[today] || false;
      } catch (error) {
      }
      
      // 출석체크가 완료된 경우 백엔드 API 호출을 건너뛰고 로컬 상태만 업데이트
      if (isAttendanceChecked) {
        const currentChallenges = get().challenges;
        const updatedChallenges = currentChallenges.map(challenge => {
          if (challenge.id === 'attendance') {
            return {
              ...challenge,
              status: 'completed' as const,
              progress: challenge.maxProgress,
              rewardClaimed: true, // 출석체크 완료 시 보상도 자동 수령
            };
          }
          // 보상 수령 상태 복원
          if (claimedRewardsToday.includes(challenge.id)) {
            return {
              ...challenge,
              rewardClaimed: true,
            };
          }
          // 텀블러 인증 완료 상태 복원
          if (challenge.id === 'tumbler' && isTumblerVerifiedToday) {
            return {
              ...challenge,
              status: 'completed' as const,
              progress: challenge.maxProgress,
            };
          }
          return challenge;
        });
        set({ challenges: updatedChallenges });
        set({ isLoading: false });
        return;
      }
      
      // 출석체크가 완료되지 않은 경우에만 백엔드 API 호출
      const response = await challengeApi.getTodayChallenges();
      
      if (response.isSuccess && response.result) {
        set({ todayChallenges: response.result.challenges });
        
        const updatedChallenges = response.result.challenges.map((challengeInstance) => {
          const existingChallenge = get().challenges.find(c => c.id === challengeInstance.challengeId);
          if (existingChallenge) {
            const newStatus = challengeInstance.status === 'completed' ? 'completed' : 
                             challengeInstance.status === 'in_progress' ? 'in_progress' : 'pending';
            const newProgress = newStatus === 'completed' ? existingChallenge.maxProgress : 
                               newStatus === 'in_progress' ? Math.max(existingChallenge.progress, 1) : 0;
            
            // 보상 수령 상태는 로컬 저장소 우선, 없으면 백엔드 데이터 사용
            const isRewardClaimed = claimedRewardsToday.includes(existingChallenge.id) || challengeInstance.awarded;
            
            // 텀블러 인증 완료 상태는 로컬 저장소 우선
            let finalStatus = newStatus;
            let finalProgress = newProgress;
            
            if (existingChallenge.id === 'tumbler' && isTumblerVerifiedToday) {
              finalStatus = 'completed';
              finalProgress = existingChallenge.maxProgress;
            }
            
            return {
              ...existingChallenge,
              status: finalStatus,
              points: challengeInstance.rewardPoints,
              rewardClaimed: isRewardClaimed,
              progress: finalProgress,
            };
          }
          return existingChallenge;
        }).filter(Boolean);
        
        set({ challenges: updatedChallenges });
      } else {
        set({ challenges: initialChallenges });
      }
    } catch (error) {
      set({ challenges: initialChallenges });
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
    
    set((state) => {
      const updatedChallenges = state.challenges.map((challenge) => {
        if (challenge.id === challengeId) {
          const updatedChallenge = { ...challenge, status: 'completed', completedAt: now };
          return updatedChallenge;
        }
        return challenge;
      });
      
      return {
        challenges: updatedChallenges,
        completedChallenges: [...state.completedChallenges, challengeId],
      };
    });
  },

  claimReward: async (challengeId: string) => {
    const now = new Date().toISOString();
    const today = new Date().toISOString().split('T')[0];
    
    set((state) => ({
      challenges: state.challenges.map((challenge) =>
        challenge.id === challengeId
          ? { ...challenge, rewardClaimed: true }
          : challenge
      ),
      claimedRewards: [...state.claimedRewards, challengeId],
    }));
    
    // AsyncStorage에 보상 수령 상태 저장
    try {
      const claimedRewardsData = JSON.parse(await AsyncStorage.getItem('claimedRewardsData') || '{}');
      if (!claimedRewardsData[today]) {
        claimedRewardsData[today] = [];
      }
      if (!claimedRewardsData[today].includes(challengeId)) {
        claimedRewardsData[today].push(challengeId);
        await AsyncStorage.setItem('claimedRewardsData', JSON.stringify(claimedRewardsData));
      }
    } catch (error) {
    }
  },

  claimChallengeReward: async (userChallengeId: string): Promise<boolean> => {
    try {
      const response = await challengeApi.claimChallengeReward(userChallengeId);
      
      if (response.isSuccess) {
        set((state) => ({
          todayChallenges: state.todayChallenges.map((challenge) =>
            challenge.instanceId === userChallengeId
              ? { ...challenge, awarded: true, awardedAt: new Date().toISOString() }
              : challenge
          ),
        }));
        
        const challengeInstance = get().todayChallenges.find(c => c.instanceId === userChallengeId);
        if (challengeInstance) {
          get().claimReward(challengeInstance.challengeId);
        }
        
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  },

  checkAttendance: async () => {
    const { updateChallengeProgress, completeChallenge } = get();
    
    // 오늘 날짜 확인
    const today = new Date().toISOString().split('T')[0];
    
    // 이미 오늘 출석체크를 했는지 확인
    const isAlreadyChecked = await get().isAttendanceCheckedToday();
    if (isAlreadyChecked) {
      return;
    }
    
    // 출석체크 완료 처리
    updateChallengeProgress('attendance', 1);
    completeChallenge('attendance');
    
    // AsyncStorage에 오늘 출석체크 완료 상태 저장
    try {
      const attendanceData = JSON.parse(await AsyncStorage.getItem('attendanceData') || '{}');
      attendanceData[today] = true;
      await AsyncStorage.setItem('attendanceData', JSON.stringify(attendanceData));
    } catch (error) {
    }
  },

  isAttendanceCheckedToday: async (): Promise<boolean> => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const attendanceData = JSON.parse(await AsyncStorage.getItem('attendanceData') || '{}');
      return attendanceData[today] === true;
    } catch (error) {
      return false;
    }
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

  verifyTumbler: async (isVerified: boolean) => {
    const { updateChallengeProgress, completeChallenge, setTumblerVerificationFailed } = get();
    const today = new Date().toISOString().split('T')[0];
    
    if (isVerified) {
      updateChallengeProgress('tumbler', 1);
      completeChallenge('tumbler');
      setTumblerVerificationFailed(false); // 성공 시 실패 상태 초기화
      
      // 텀블러 인증 완료 상태를 AsyncStorage에 저장
      try {
        const tumblerData = JSON.parse(await AsyncStorage.getItem('tumblerData') || '{}');
        tumblerData[today] = true;
        await AsyncStorage.setItem('tumblerData', JSON.stringify(tumblerData));
      } catch (error) {
      }
    } else {
      setTumblerVerificationFailed(true); // 실패 시 상태 설정
    }
  },

  setTumblerVerificationFailed: (failed: boolean) => {
    set({ tumblerVerificationFailed: failed });
  },
}));

