import React, { useState, useEffect } from 'react';
import { ScrollView, SafeAreaView, Alert } from 'react-native';
import { commonStyles } from '../styles/commonStyles';
import type { Transaction } from '../types/dashboard';
import { useChallengeStore } from '../store/challengeStore';
import type { Challenge } from '../types/challenge';
import { healthService } from '../services/healthService';
import TumblerVerificationModal from '../components/challenge/TumblerVerificationModal';
import { challengeApi } from '../api/challenge';
import { challengeDetectionService } from '../services/challengeDetectionService';
import { debugTokenStatus, testServerConnection } from '../api/axios';
import ChallengeHeader from '../components/challenge/ChallengeHeader';
import ChallengeInfoCard from '../components/challenge/ChallengeInfoCard';
import ChallengeTab from '../components/challenge/ChallengeTab';
import ChallengeList from '../components/challenge/ChallengeList';
import RewardModal from '../components/challenge/RewardModal';

const ChallengeScreen = () => {
  const {
    challenges,
    todayChallenges,
    isLoading,
    tumblerVerificationFailed,
    initializeChallenges,
    loadTodayChallenges,
    checkAttendance,
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
  const [isAttendanceLoading, setIsAttendanceLoading] = useState(false);
  
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
        // 서버 연결 테스트
        console.log('🔍 ChallengeScreen 로드 시작 - 서버 연결 테스트');
        await testServerConnection();
        
        // 토큰 상태 디버깅
        console.log('🔍 ChallengeScreen 로드 시작 - 토큰 상태 확인');
        await debugTokenStatus();
        
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

  useEffect(() => {
    if (challenges.length === 0 && !isLoading) {
      initializeChallenges();
    }
  }, [challenges.length, isLoading]);

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

  useEffect(() => {
    const detectChallengesFromTransactions = async () => {
      try {
        const detectionResult = await challengeDetectionService.detectTodayChallenges();
        setChallengeDetectionResult(detectionResult);
        
        if (detectionResult.transportUsed) {
          console.log('🚌 대중교통 이용 감지됨');
          checkTransportUsage(true);
          
          const transportChallenge = challenges.find(c => c.type === 'transport');
          console.log('🚌 대중교통 챌린지 상태:', transportChallenge);
          
          if (transportChallenge && transportChallenge.status !== 'completed') {
            console.log('🚌 대중교통 챌린지 완료 처리 시작');
            updateChallengeProgress('transport', 1);
            completeChallenge('transport');
            console.log('🚌 대중교통 챌린지 완료 처리 완료');
          } else {
            console.log('🚌 대중교통 챌린지가 이미 완료되었거나 찾을 수 없음');
          }
        }
        
        if (detectionResult.cafeUsed && tumblerVerificationFailed) {
          setTumblerVerificationFailed(false);
        }
        
      } catch (error) {
        console.error('챌린지 감지 중 에러:', error);
      }
    };

    detectChallengesFromTransactions();
  }, []);

  const handleAttendanceCheck = async (retryCount = 0) => {
    setIsAttendanceLoading(true);
    try {
      // 출석체크 전 토큰 상태 확인
      console.log('🔍 출석체크 시작 - 토큰 상태 확인');
      await debugTokenStatus();
      
      const response = await challengeApi.checkAttendance();
      
      if (response.success) {
        checkAttendance();
        Alert.alert(
          '출석체크 완료! 🎉', 
          `출석체크가 완료되었습니다!\n\n획득 포인트: ${response.pointsEarned || 100}P\n\n보상받기 버튼을 눌러 포인트를 수령하세요!`,
          [{ text: '확인', style: 'default' }]
        );
      } else {
        let errorTitle = '출석체크 실패';
        let errorMessage = response.message || '출석체크 중 오류가 발생했습니다.';
        let additionalInfo = '';
        
        if (response.message?.includes('서버 내부 오류')) {
          errorTitle = '서버 오류';
          errorMessage = '서버에서 일시적인 오류가 발생했습니다.';
          additionalInfo = '\n\n가능한 원인:\n• 서버가 일시적으로 과부하 상태\n• 데이터베이스 연결 문제\n• 백엔드 서비스 점검 중\n\n잠시 후 다시 시도해주세요.';
        } else if (response.message?.includes('이미 출석체크')) {
          errorTitle = '이미 출석체크 완료';
          errorMessage = '오늘은 이미 출석체크를 완료하셨습니다.';
          additionalInfo = '\n\n내일 다시 출석체크해주세요!';
        }
        
        Alert.alert(
          errorTitle, 
          errorMessage + additionalInfo,
          [
            { text: '확인', style: 'default' },
            { text: '다시 시도', style: 'default', onPress: () => handleAttendanceCheck() }
          ]
        );
      }
    } catch (error: any) {
      let errorTitle = '출석체크 오류';
      let errorMessage = '출석체크 중 오류가 발생했습니다.';
      
      if (error.message.includes('Network Error') || error.code === 'NETWORK_ERROR') {
        errorTitle = '네트워크 오류';
        errorMessage = '인터넷 연결을 확인해주세요.\n서버에 연결할 수 없습니다.';
      } else if (error.response?.status === 404) {
        errorTitle = 'API 오류';
        errorMessage = '출석체크 서비스를 찾을 수 없습니다.\n개발팀에 문의해주세요.';
      } else if (error.response?.status === 500) {
        errorTitle = '서버 내부 오류';
        errorMessage = '서버에서 일시적인 오류가 발생했습니다.\n\n가능한 원인:\n• 서버가 일시적으로 과부하 상태\n• 데이터베이스 연결 문제\n• 백엔드 서비스 점검 중\n\n잠시 후 다시 시도해주세요.';
        
        // 500 에러 시 재시도 로직 (최대 2번)
        if (retryCount < 2) {
          console.log(`🔄 500 에러 재시도 ${retryCount + 1}/2`);
          setTimeout(() => {
            handleAttendanceCheck(retryCount + 1);
          }, 2000); // 2초 후 재시도
          return;
        } else {
          // 재시도 실패 시 서버 상태 확인
          console.log('🔍 서버 상태 확인 중...');
          const healthCheck = await challengeApi.healthCheck();
          console.log('🏥 서버 상태:', healthCheck);
        }
      } else if (error.response?.status === 403) {
        errorTitle = '인증 오류';
        errorMessage = '로그인이 필요합니다.\n로그인 후 다시 시도해주세요.';
      } else if (error.response?.status >= 400) {
        errorTitle = `서버 오류 (${error.response.status})`;
        errorMessage = `서버에서 오류가 발생했습니다.\n\n오류 코드: ${error.response.status}\n${error.response.data?.message || '알 수 없는 오류'}`;
      }
      
      Alert.alert(
        errorTitle,
        `${errorMessage}\n\n오류 코드: ${error.response?.status || 'NETWORK_ERROR'}`,
        [
          { text: '확인', style: 'default' },
          { text: '다시 시도', style: 'default', onPress: () => handleAttendanceCheck(0) }
        ]
      );
    } finally {
      setIsAttendanceLoading(false);
    }
  };

  const handleRefreshSteps = async () => {
    if (!isPedometerAvailable) {
      Alert.alert('알림', '이 기기에서는 걸음수 측정이 지원되지 않습니다.');
      return;
    }

    setIsStepsLoading(true);
    try {
      // 걸음수 업데이트 전 토큰 상태 확인
      console.log('🔍 걸음수 업데이트 시작 - 토큰 상태 확인');
      await debugTokenStatus();
      
      const stepData = await healthService.getTodaySteps();
      const response = await challengeApi.updateSteps(stepData.steps);
      
      if (response.success) {
        updateSteps(response.progress);
        if (response.isCompleted) {
          Alert.alert('챌린지 완료!', `만보기 챌린지를 완료했습니다! ${response.pointsEarned}포인트를 획득했습니다!`);
        }
      } else {
        Alert.alert('오류', response.message || '걸음수 업데이트 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.log('Error fetching steps:', error);
      Alert.alert('오류', '걸음수 데이터를 가져오는 중 오류가 발생했습니다.');
    } finally {
      setIsStepsLoading(false);
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
          claimReward(selectedChallenge.id);
          Alert.alert('보상 수령 완료!', `${selectedChallenge.points}포인트를 획득했습니다!`);
        } else {
          const challengeInstance = todayChallenges.find(c => c.challengeId === selectedChallenge.id);
          if (!challengeInstance) {
            claimReward(selectedChallenge.id);
            Alert.alert('보상 수령 완료!', `${selectedChallenge.points}포인트를 획득했습니다!`);
          } else {
            const success = await claimChallengeReward(challengeInstance.instanceId);
            
            if (success) {
              Alert.alert('보상 수령 완료!', `${selectedChallenge.points}포인트를 획득했습니다!`);
            } else {
              claimReward(selectedChallenge.id);
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
      const detectionResult = await challengeDetectionService.detectTodayChallenges();
      setChallengeDetectionResult(detectionResult);
      
      if (detectionResult.transportUsed) {
        checkTransportUsage(true);
        
        const transportChallenge = challenges.find(c => c.type === 'transport');
        if (transportChallenge && transportChallenge.status !== 'completed') {
          updateChallengeProgress('transport', 1);
          completeChallenge('transport');
        }
      }
      
      if (detectionResult.cafeUsed && tumblerVerificationFailed) {
        setTumblerVerificationFailed(false);
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
    <SafeAreaView style={commonStyles.container}>
      <ScrollView style={commonStyles.scrollView} showsVerticalScrollIndicator={false}>
        <ChallengeHeader 
          isRefreshing={isRefreshing}
          onRefresh={handleRefreshTransactions}
        />
        
        <ChallengeInfoCard />
        
        <ChallengeTab currentDate={getCurrentDate()} />
        
        <ChallengeList
          challenges={challenges}
          isLoading={isLoading}
          challengeDetectionResult={challengeDetectionResult}
          isAttendanceLoading={isAttendanceLoading}
          isStepsLoading={isStepsLoading}
          tumblerVerificationFailed={tumblerVerificationFailed}
          onInitializeChallenges={initializeChallenges}
          onAttendanceCheck={handleAttendanceCheck}
          onRefreshSteps={handleRefreshSteps}
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
