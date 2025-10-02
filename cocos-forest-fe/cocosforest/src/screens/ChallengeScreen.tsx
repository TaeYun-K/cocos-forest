import React, { useState, useEffect, useRef } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { ScrollView, SafeAreaView, Alert, RefreshControl } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { commonStyles, colors } from '../styles/commonStyles';
import type { Transaction } from '../types/dashboard';
import { useChallengeStore } from '../store/challengeStore';
import type { Challenge } from '../types/challenge';
import { healthService } from '../services/healthService';
import TumblerVerificationModal from '../components/challenge/TumblerVerificationModal';
import { challengeApi } from '../api/challenge';
import { challengeDetectionService } from '../services/challengeDetectionService';
import { UnifiedHeader } from '../components/common';
import ChallengeInfoCard from '../components/challenge/ChallengeInfoCard';
import ChallengeList from '../components/challenge/ChallengeList';
import RewardModal from '../components/challenge/RewardModal';
import { redirectToAccountLinking, isAccountLinkingError } from '../utils/accountLinkingUtils';
import { useTodayData } from '../hooks/useDashboardQueries';

const ChallengeScreen = () => {
  const queryClient = useQueryClient();
  const navigation = useNavigation();
  const scrollViewRef = useRef<ScrollView>(null);
  const {
    challenges,
    todayChallenges,
    isLoading,
    tumblerVerificationFailed,
    initializeChallenges,
    loadTodayChallenges,
    checkAttendance,
    isAttendanceCheckedToday,
    updateSteps,
    checkTransportUsage,
    verifyTumbler,
    claimReward,
    claimChallengeReward,
    setTumblerVerificationFailed,
    updateChallengeProgress,
    completeChallenge,
  } = useChallengeStore();

  const [isStepsLoading, setIsStepsLoading] = useState(false);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [showTumblerModal, setShowTumblerModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);
  const [isAttendanceLoading, setIsAttendanceLoading] = useState(false);
  const [hasShownAccountError, setHasShownAccountError] = useState(false);

  // 챌린지 화면에서도 데이터 에러 감지를 위해 쿼리 구독
  const { data: todayData, error: todayDataError } = useTodayData();

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    return `${year}년 ${month}월 ${day}일`;
  };

  const [challengeDetectionResult, setChallengeDetectionResult] = useState<{
    transportUsed: boolean;
    cafeUsed: boolean;
    transportTransactions: Transaction[];
    cafeTransactions: Transaction[];
  }>({
    transportUsed: false,
    cafeUsed: false,
    transportTransactions: [],
    cafeTransactions: []
  });

  useEffect(() => {
    const loadChallengeStatus = async () => {
      try {
        await loadTodayChallenges();
      } catch (error) {
        console.error('챌린지 상태 로드 실패:', error);
        initializeChallenges();
      }
    };

    initializeChallenges();
    setTimeout(() => {
      loadChallengeStatus();
    }, 500);
  }, []);

  // todayData 변경 시 챌린지 감지 (무한 루프 방지: todayData만 dependency)
  useEffect(() => {
    if (!todayData) return;

    const detectionResult = challengeDetectionService.detectFromData(todayData);
    setChallengeDetectionResult(detectionResult);

    // 대중교통 챌린지 자동 완료 처리
    if (detectionResult.transportUsed) {
      checkTransportUsage(true);
      const transportChallenge = challenges.find(c => c.type === 'transport');
      if (transportChallenge && transportChallenge.status !== 'completed') {
        updateChallengeProgress('transport', 1);
        completeChallenge('transport');
        const todayInstance = todayChallenges.find(tc => tc.challengeId === 'transport');
        if (todayInstance) {
          challengeApi.completeChallenge(todayInstance.instanceId).catch(err =>
            console.warn('대중교통 챌린지 완료 동기화 실패:', err)
          );
        }
      }
    }

    // 텀블러 인증 실패 상태 초기화
    if (detectionResult.cafeUsed && tumblerVerificationFailed) {
      setTumblerVerificationFailed(false);
    }
  }, [todayData]); // todayData만 dependency로 설정하여 무한 루프 방지

  // 탭 진입(포커스) 시 데이터 새로고침 (간소화)
  useFocusEffect(
    useCallback(() => {
      // 최상단으로 스크롤
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });

      // 챌린지 상태만 로드 (챌린지 감지는 useEffect에서 처리)
      loadTodayChallenges().catch(e => {
        console.error('포커스 시 챌린지 데이터 로드 실패:', e);
      });
    }, []) // dependency 최소화
  );

  useEffect(() => {
    if (challenges.length === 0 && !isLoading) {
      initializeChallenges();
    }
  }, [challenges.length, isLoading]);

  // Pull-to-refresh 함수 (간소화: React Query 캐시만 무효화)
  const onPullRefresh = useCallback(async () => {
    setIsPullRefreshing(true);
    try {
      // React Query 캐시 무효화 → todayData 자동 재로드 → useEffect에서 챌린지 감지
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['todayData'] }),
        queryClient.invalidateQueries({ queryKey: ['dayDetails'] }),
        loadTodayChallenges()
      ]);
    } catch (error) {
      console.error('Pull refresh error:', error);

      // 계좌 연결 관련 에러인지 확인하고 프로필 화면으로 안내
      if (isAccountLinkingError(error)) {
        redirectToAccountLinking(navigation, '챌린지 데이터를 불러오는데 실패했습니다.\n\n계좌 연결 후 다시 시도해주세요.');
      }
    } finally {
      setIsPullRefreshing(false);
    }
  }, [queryClient, loadTodayChallenges, navigation]);

  useEffect(() => {
    const checkHealthAvailability = async () => {
      try {
        const isAvailable = healthService.isHealthDataAvailable();
        setIsPedometerAvailable(isAvailable);
      } catch (error) {
        setIsPedometerAvailable(false);
      }
    };

    checkHealthAvailability();
  }, []);

  // 400 에러 감지 시 계좌 연결 안내 (즉시 실행)
  useEffect(() => {
    if (hasShownAccountError || !todayDataError) return;

    if (isAccountLinkingError(todayDataError)) {
      console.log('🚀 빠른 에러 감지: 계좌 연결 필요');
      setHasShownAccountError(true);
      redirectToAccountLinking(navigation, '챌린지 데이터를 불러오는데 실패했습니다.\n\n계좌 연결 후 다시 시도해주세요.');
    }
  }, [todayDataError, navigation, hasShownAccountError]);

  useEffect(() => {
    const fetchTodaySteps = async () => {
      if (!isPedometerAvailable) return;

      try {
        const stepData = await healthService.getTodaySteps();
        console.log('🦶 걸음수 데이터:', stepData);
        
        const response = await challengeApi.updateSteps(stepData.steps);
        console.log('📊 걸음수 API 응답:', response);
        
        if (response.success) {
          updateSteps(response.progress);
          console.log('✅ 걸음수 업데이트 성공:', response.progress);
        } else {
          updateSteps(stepData.steps);
          console.log('⚠️ API 실패, 로컬 걸음수 사용:', stepData.steps);
        }
      } catch (error) {
        console.error('❌ 걸음수 업데이트 실패:', error);
        // API 실패 시에도 로컬 걸음수는 업데이트
        try {
          const stepData = await healthService.getTodaySteps();
          updateSteps(stepData.steps);
          console.log('🔄 로컬 걸음수로 업데이트:', stepData.steps);
        } catch (localError) {
          console.error('❌ 로컬 걸음수 조회도 실패:', localError);
        }
      }
    };

    fetchTodaySteps();
  }, [isPedometerAvailable]);

  const handleAttendanceCheck = async () => {
    setIsAttendanceLoading(true);
    try {
      // 백엔드에서 출석체크 상태 확인
      const attendanceChallenge = challenges.find(c => c.type === 'attendance');
      if (attendanceChallenge?.status === 'completed') {
        Alert.alert('알림', '이미 오늘 출석체크를 완료했습니다.');
        return;
      }

      // 오늘의 챌린지 목록에서 출석 인스턴스 찾기
      const attendanceInstance = todayChallenges.find(c => c.challengeId === 'attendance');

      // 백엔드에 완료 처리
      if (attendanceInstance) {
        const completeRes = await challengeApi.completeChallenge(attendanceInstance.instanceId);
        if (!completeRes.success) {
          console.warn('출석 완료 동기화 실패:', completeRes.message);
        }
      }

      // 로컬 상태 업데이트
      updateChallengeProgress('attendance', 1);
      completeChallenge('attendance');
      
      // AsyncStorage에도 저장
      const today = new Date().toISOString().split('T')[0];
      try {
        const attendanceData = JSON.parse(await AsyncStorage.getItem('attendanceData') || '{}');
        attendanceData[today] = true;
        await AsyncStorage.setItem('attendanceData', JSON.stringify(attendanceData));
        
        // 출석체크 완료 시 보상도 자동 수령 처리
        await claimReward('attendance');
      } catch (error) {
        console.warn('출석체크 상태 저장 실패:', error);
      }
      
      Alert.alert(
        '출석체크 완료! 🎉',
        '출석체크가 완료되었습니다!\n\n보상받기 버튼을 눌러 포인트를 수령하세요!',
        [{ text: '확인', style: 'default' }]
      );
    } catch (error: any) {
      console.error('출석체크 처리 실패:', error);

      // 계좌 연결 관련 에러인지 확인
      if (isAccountLinkingError(error)) {
        redirectToAccountLinking(navigation, '출석체크를 위해 계좌 연결이 필요합니다.');
        return;
      }

      const status = error?.response?.status;
      const message = status === 400
        ? '계좌 정보가 필요합니다. 계좌 연결 후 다시 시도해주세요.'
        : status === 403
        ? '인증이 만료되었거나 로그인 정보가 없습니다. 다시 로그인 후 시도해주세요.'
        : '출석체크 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      Alert.alert('오류', message);
    } finally {
      setIsAttendanceLoading(false);
    }
  };


  const handleClaimReward = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setShowRewardModal(true);
  };

  const handleConfirmReward = async () => {
    if (selectedChallenge) {
      try {
        if (selectedChallenge.type === 'attendance') {
          await claimReward(selectedChallenge.id);
          Alert.alert('보상 수령 완료!', `${selectedChallenge.points}포인트를 획득했습니다!`);
        } else {
          const challengeInstance = todayChallenges.find(c => c.challengeId === selectedChallenge.id);
          if (!challengeInstance) {
            await claimReward(selectedChallenge.id);
            Alert.alert('보상 수령 완료!', `${selectedChallenge.points}포인트를 획득했습니다!`);
          } else {
            const success = await claimChallengeReward(challengeInstance.instanceId);
            
            if (success) {
              Alert.alert('보상 수령 완료!', `${selectedChallenge.points}포인트를 획득했습니다!`);
            } else {
              await claimReward(selectedChallenge.id);
              Alert.alert('보상 수령 완료!', `${selectedChallenge.points}포인트를 획득했습니다!`);
            }
          }
        }
      } catch (error) {
        console.error('보상 수령 오류:', error);
        Alert.alert('오류', '보상 수령 중 오류가 발생했습니다.');
      } finally {
        setShowRewardModal(false);
        setSelectedChallenge(null);
      }
    } else {
      setShowRewardModal(false);
      setSelectedChallenge(null);
    }
  };

  const handleTumblerVerification = () => {
    setShowTumblerModal(true);
  };

  const handleTumblerVerificationSuccess = async () => {
    try {
      verifyTumbler(true);
      setShowTumblerModal(false);
      setTumblerVerificationFailed(false);
      
      try {
        const tumblerChallenge = challenges.find(c => c.id === 'tumbler');
        if (tumblerChallenge) {
          const todayChallenge = todayChallenges.find(tc => tc.challengeId === 'tumbler');
          if (todayChallenge) {
            const completeResponse = await challengeApi.completeChallenge(todayChallenge.instanceId);
            if (!completeResponse.success) {
              console.warn('백엔드 동기화 실패:', completeResponse.message);
            }
          }
        }
      } catch (apiError) {
        console.error('백엔드 동기화 실패:', apiError);
      }
    } catch (error) {
      console.error('텀블러 인증 성공 처리 중 오류:', error);
      Alert.alert('오류', '텀블러 인증 처리 중 오류가 발생했습니다.');
    }
  };

  const handleTumblerVerificationFailure = () => {
    verifyTumbler(false);
    setTumblerVerificationFailed(true);
    setShowTumblerModal(false);
  };

  const handleRefreshTransactions = async () => {
    setIsRefreshing(true);
    try {
      // 출석체크 상태 보존
      const attendanceChallenge = challenges.find(c => c.type === 'attendance');
      const wasAttendanceCompleted = attendanceChallenge?.status === 'completed';

      // React Query 캐시 무효화 → todayData 재로드 → useEffect에서 자동 감지
      await queryClient.invalidateQueries({ queryKey: ['todayData'] });
      await queryClient.invalidateQueries({ queryKey: ['dayDetails'] });

      // 출석체크 상태 복원
      if (wasAttendanceCompleted) {
        const updatedAttendanceChallenge = challenges.find(c => c.type === 'attendance');
        if (updatedAttendanceChallenge && updatedAttendanceChallenge.status !== 'completed') {
          updateChallengeProgress('attendance', 1);
          completeChallenge('attendance');
        }
      }

      Alert.alert('새로고침 완료', '결제내역을 다시 확인했습니다.');

    } catch (error) {
      console.error('결제내역 새로고침 중 에러:', error);
      Alert.alert('오류', '결제내역을 새로고침하는 중 오류가 발생했습니다.');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={commonStyles.safeContainer}>
      <ScrollView
        ref={scrollViewRef}
        style={commonStyles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isPullRefreshing}
            onRefresh={onPullRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <UnifiedHeader
          title="환경 챌린지"
          showRefresh={false}
          isRefreshing={isRefreshing}
          onRefresh={handleRefreshTransactions}
          showEco={false}
        />
        
        <ChallengeInfoCard />

        <ChallengeList
          challenges={challenges}
          isLoading={isLoading}
          challengeDetectionResult={challengeDetectionResult}
          isAttendanceLoading={isAttendanceLoading}
          tumblerVerificationFailed={tumblerVerificationFailed}
          onInitializeChallenges={initializeChallenges}
          onAttendanceCheck={handleAttendanceCheck}
          onTumblerVerification={handleTumblerVerification}
          onClaimReward={handleClaimReward}
        />
      </ScrollView>

      <RewardModal
        visible={showRewardModal}
        selectedChallenge={selectedChallenge}
        onClose={() => setShowRewardModal(false)}
        onConfirm={handleConfirmReward}
      />

      <TumblerVerificationModal
        visible={showTumblerModal}
        onClose={() => setShowTumblerModal(false)}
        onSuccess={handleTumblerVerificationSuccess}
        onFailure={handleTumblerVerificationFailure}
      />
    </SafeAreaView>
  );
};


export default ChallengeScreen;
