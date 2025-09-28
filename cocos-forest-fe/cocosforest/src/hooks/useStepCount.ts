import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import stepCountService, { StepCountData } from '../services/stepCountService';
import { updateStepCount, StepCountUpdateRequest } from '../api/home';

export interface UseStepCountReturn {
  todaySteps: number;
  isLoading: boolean;
  isRefreshing: boolean;
  lastUpdated: Date | null;
  error: string | null;
  refreshStepCount: () => Promise<void>;
  syncStepCount: () => Promise<void>;
  isStepCountAvailable: boolean;
  serviceInfo: {
    platform: string;
    healthKitAvailable: boolean;
    pedometerAvailable: boolean;
    isAvailable: boolean;
  };
}

export const useStepCount = (): UseStepCountReturn => {
  const [todaySteps, setTodaySteps] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 서비스 정보 가져오기
  const serviceInfo = stepCountService.getServiceInfo();

  // 걸음수 조회 함수
  const fetchStepCount = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);

      // 권한 확인 및 요청
      const hasPermission = await stepCountService.requestPermissions();
      if (!hasPermission) {
        throw new Error('걸음수 측정 권한이 필요합니다.');
      }

      // 오늘의 걸음수 가져오기
      const result = await stepCountService.getTodayStepCount();
      
      if (result.success && result.data) {
        setTodaySteps(result.data.steps);
        setLastUpdated(new Date());
        console.log('걸음수 조회 성공:', result.data.steps);
      } else {
        throw new Error(result.error || '걸음수를 가져올 수 없습니다.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '걸음수 조회 중 오류가 발생했습니다.';
      setError(errorMessage);
      console.error('걸음수 조회 실패:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // 걸음수 새로고침
  const refreshStepCount = useCallback(async () => {
    await fetchStepCount(false);
  }, [fetchStepCount]);

  // 걸음수 동기화 (서버에 업데이트)
  const syncStepCount = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setError(null);

      // 현재 걸음수 가져오기
      const result = await stepCountService.getTodayStepCount();
      
      if (!result.success || !result.data) {
        throw new Error(result.error || '걸음수를 가져올 수 없습니다.');
      }

      const stepData: StepCountUpdateRequest = {
        steps: result.data.steps,
        date: result.data.date,
      };

      // 서버에 걸음수 업데이트
      const updateResult = await updateStepCount(stepData);
      
      if (updateResult.success) {
        setTodaySteps(result.data.steps);
        setLastUpdated(new Date());
        
        // 포인트 획득 알림
        if (updateResult.pointsEarned && updateResult.pointsEarned > 0) {
          Alert.alert(
            '포인트 획득!',
            `걸음수 ${result.data.steps}보로 ${updateResult.pointsEarned}포인트를 획득했습니다!\n총 포인트: ${updateResult.totalPoints || 0}P`
          );
        } else {
          Alert.alert('동기화 완료', '걸음수가 성공적으로 동기화되었습니다.');
        }
        
        console.log('걸음수 동기화 성공:', updateResult);
      } else {
        throw new Error(updateResult.message || '걸음수 동기화에 실패했습니다.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '걸음수 동기화 중 오류가 발생했습니다.';
      setError(errorMessage);
      Alert.alert('동기화 실패', errorMessage);
      console.error('걸음수 동기화 실패:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // 컴포넌트 마운트 시 걸음수 조회
  useEffect(() => {
    if (serviceInfo.isAvailable) {
      fetchStepCount();
    }
  }, [fetchStepCount, serviceInfo.isAvailable]);

  return {
    todaySteps,
    isLoading,
    isRefreshing,
    lastUpdated,
    error,
    refreshStepCount,
    syncStepCount,
    isStepCountAvailable: serviceInfo.isAvailable,
    serviceInfo,
  };
};


