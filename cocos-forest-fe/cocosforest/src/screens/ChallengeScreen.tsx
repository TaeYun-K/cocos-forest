import * as React from 'react';
import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
  Image
} from 'react-native';
// @ts-ignore
import Pedometer from 'react-native-pedometer';

const ChallengeScreen = () => {
  const [currentSteps, setCurrentSteps] = useState(7300);
  const targetSteps = 10000;
  const [activeTab, setActiveTab] = useState('progress');
  const [isLoading, setIsLoading] = useState(false);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState(false);
  
  // 현재 날짜를 가져오는 함수
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    return `${year}년 ${month}월 ${day}일`;
  };
  
  // 대중교통 챌린지 상태
  const [transportProgress, setTransportProgress] = useState(0);
  const [isTransportCompleted, setIsTransportCompleted] = useState(false);
  
  // 다회용기 챌린지 상태
  const [containerProgress, setContainerProgress] = useState(0);
  const [isContainerCompleted, setIsContainerCompleted] = useState(false);
  
  // 탄소배출량 줄이기 챌린지 상태
  const [carbonProgress, setCarbonProgress] = useState(0);
  const [isCarbonCompleted, setIsCarbonCompleted] = useState(false);
  const [isCarbonFailed, setIsCarbonFailed] = useState(false);
  const [carbonStartTime, setCarbonStartTime] = useState(() => {
    // 오늘 자정부터 시작
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [currentCarbonEmission, setCurrentCarbonEmission] = useState(0); // 현재 탄소배출량 (kg)
  const CARBON_LIMIT = 4.2; // 하루 탄소배출량 한계 (kg)

  const progress = Math.min((currentSteps / targetSteps) * 100, 100);
  const remainingSteps = targetSteps - currentSteps;

  // 탄소배출량 줄이기 챌린지 진행률 계산 (24시간 기준)
  const calculateCarbonProgress = () => {
    const now = new Date();
    const timeDiff = now.getTime() - carbonStartTime.getTime();
    const hoursElapsed = timeDiff / (1000 * 60 * 60); // 시간 단위
    const progressPercentage = Math.min((hoursElapsed / 24) * 100, 100);
    return Math.round(progressPercentage);
  };

  // 탄소배출량 시뮬레이션 (실제로는 금융 데이터에서 계산)
  const simulateCarbonEmission = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // 시간에 따라 탄소배출량이 증가하는 시뮬레이션
    // 실제로는 금융 거래 데이터를 기반으로 계산
    let baseEmission = 0;
    
    // 시간대별 기본 배출량 (예시)
    if (currentHour >= 6 && currentHour < 9) {
      baseEmission = 0.8; // 출근 시간
    } else if (currentHour >= 9 && currentHour < 12) {
      baseEmission = 1.2; // 오전 활동
    } else if (currentHour >= 12 && currentHour < 14) {
      baseEmission = 1.8; // 점심 시간
    } else if (currentHour >= 14 && currentHour < 18) {
      baseEmission = 2.2; // 오후 활동
    } else if (currentHour >= 18 && currentHour < 21) {
      baseEmission = 2.8; // 저녁 시간
    } else if (currentHour >= 21) {
      baseEmission = 3.2; // 밤 시간
    }
    
    // 분 단위로 미세 조정
    const minuteAdjustment = (currentMinute / 60) * 0.2;
    const randomVariation = (Math.random() - 0.5) * 0.3; // ±0.15kg 변동
    
    return Math.max(0, baseEmission + minuteAdjustment + randomVariation);
  };

  // 탄소배출량 줄이기 챌린지 상태 업데이트
  useEffect(() => {
    const updateCarbonChallenge = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentProgress = calculateCarbonProgress();
      const currentEmission = simulateCarbonEmission();
      
      setCarbonProgress(currentProgress);
      setCurrentCarbonEmission(currentEmission);
      
      // 아직 판정이 안 된 경우에만 체크
      if (!isCarbonCompleted && !isCarbonFailed) {
        // 4.2kg 초과 시 즉시 실패
        if (currentEmission > CARBON_LIMIT) {
          setIsCarbonFailed(true);
        }
        // 24시간 완료 시: 4.2kg 이하면 성공
        else if (currentProgress >= 100) {
          setIsCarbonCompleted(true);
        }
      }
    };

    // 초기 업데이트
    updateCarbonChallenge();
    
    // 1분마다 업데이트 (실시간 진행률 확인을 위해)
    const interval = setInterval(updateCarbonChallenge, 60 * 1000);
    
    return () => clearInterval(interval);
  }, [isCarbonCompleted, isCarbonFailed]);

  // Pedometer 사용 가능 여부 확인
  useEffect(() => {
    const checkPedometerAvailability = async () => {
      try {
        const isAvailable = await Pedometer.isStepCountingAvailable();
        setIsPedometerAvailable(isAvailable);
      } catch (error) {
        console.log('Pedometer not available:', error);
        setIsPedometerAvailable(false);
      }
    };

    checkPedometerAvailability();
  }, []);

  // 오늘의 걸음수 데이터 가져오기
  const fetchTodaySteps = async () => {
    if (!isPedometerAvailable) {
      Alert.alert('알림', '이 기기에서는 걸음수 측정이 지원되지 않습니다.');
      return;
    }

    setIsLoading(true);
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

      const result = await Pedometer.queryPedometerDataBetweenDates(
        startOfDay,
        endOfDay
      );

      if (result && result.numberOfSteps !== undefined) {
        setCurrentSteps(result.numberOfSteps);
      } else {
        // 실제 데이터가 없을 경우 랜덤하게 증가
        const randomIncrease = Math.floor(Math.random() * 500) + 100;
        setCurrentSteps(prev => Math.min(prev + randomIncrease, targetSteps));
      }
    } catch (error) {
      console.log('Error fetching steps:', error);
      // 에러 발생 시 랜덤하게 증가
      const randomIncrease = Math.floor(Math.random() * 500) + 100;
      setCurrentSteps(prev => Math.min(prev + randomIncrease, targetSteps));
    } finally {
      setIsLoading(false);
    }
  };

  // 새로고침 버튼 클릭 핸들러
  const handleRefresh = () => {
    fetchTodaySteps();
  };

  // 대중교통 이용하기 버튼 클릭 핸들러
  const handleTransportChallenge = () => {
    if (!isTransportCompleted) {
      setTransportProgress(1);
      setIsTransportCompleted(true);
    }
  };

  // 다회용기 사용하기 버튼 클릭 핸들러
  const handleContainerChallenge = () => {
    if (!isContainerCompleted) {
      setContainerProgress(1);
      setIsContainerCompleted(true);
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 헤더 섹션 */}
        <View style={styles.headerSection}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.headerTitle}>환경 챌린지</Text>
              <Text style={styles.globeIcon}>🌍</Text>
            </View>
            <Text style={styles.subtitle}>지구를 위한 작은 실천</Text>
          </View>
          <View style={styles.banner}>
            <View style={styles.bannerContent}>
              <Image 
                source={require('../../assets/coco-character.png')} 
                style={styles.characterImage}
                resizeMode="contain"
              />
              <View style={styles.bannerTextContainer}>
                <Text style={styles.bannerText}>
                  매일 매일 챌린지를 완료하면서{'\n'}환경을 보호하고 포인트도 받아보세요!
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 탭 네비게이션 */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'progress' && styles.activeTab]}
            onPress={() => setActiveTab('progress')}
          >
            <Text style={[styles.tabText, activeTab === 'progress' && styles.activeTabText]}>
              진행 중 ({getCurrentDate()})
            </Text>
          {/* </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'available' && styles.activeTab]}
            onPress={() => setActiveTab('available')}
          >
            <Text style={[styles.tabText, activeTab === 'available' && styles.activeTabText]}>
              도전 가능 (2)
            </Text> */}
          </TouchableOpacity>
        </View>

        {/* 걸음수 챌린지 카드 */}
        <View style={styles.challengeCard}>
          <View style={styles.challengeHeader}>
            <View style={styles.challengeIconContainer}>
              <Text style={styles.challengeIcon}>🚶‍♂️</Text>
            </View>
            <View style={styles.challengeInfo}>
              <Text style={styles.challengeTitle}>하루 10000보 걷기</Text>
              <View style={[styles.difficultyBadge, { backgroundColor: '#f44336'}] } >
                <Text style={styles.difficultyText}>어려움</Text>
              </View>
              <Text style={styles.challengeDescription}>
                대중교통과 걷기로 탄소 배출을 줄여보세요
              </Text>
            </View>
          </View>

          {/* 현재 걸음수 섹션 */}
          <View style={styles.stepsSection}>
            <View style={styles.stepsHeader}>
              <View style={styles.stepsLabel}>
                <Text style={styles.footprintIcon}>👣</Text>
                <Text style={styles.stepsLabelText}>현재 걸음 수</Text>
              </View>
              <TouchableOpacity 
                style={[styles.refreshButton, isLoading && styles.refreshButtonDisabled]}
                onPress={handleRefresh}
                disabled={isLoading}
              >
                <Text style={styles.refreshIcon}>{isLoading ? '⏳' : '🔄'}</Text>
                <Text style={styles.refreshText}>{isLoading ? '로딩중...' : '새로고침'}</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.stepsDisplay}>
              <Text style={styles.stepsCount}>
                {currentSteps.toLocaleString()} / {targetSteps.toLocaleString()} 보
              </Text>
              <Text style={styles.remainingSteps}>
                목표까지 {remainingSteps.toLocaleString()} 보 남음
              </Text>
            </View>
          </View>

          {/* 보상 및 진행률 */}
          <View style={styles.rewardSection}>
            <View style={styles.rewardInfo}>
              <View style={styles.rewardTag}>
                <Text style={styles.rewardIcon}></Text>
                <Text style={styles.rewardText}>운동</Text>
              </View>
              <Text style={styles.pointsText}>200포인트</Text>
            </View>
            
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${progress}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
            </View>
          </View>
        </View>

        {/* 추가 챌린지 카드들 */}
        <View style={styles.additionalChallengesContainer}>
          {/* 대중교통 이용하기 챌린지 */}
          <View style={[
            styles.additionalChallengeCard, 
            { backgroundColor: isTransportCompleted ? '#e8f5e8' : '#fff' }
          ]}>
            <View style={styles.additionalChallengeHeader}>
              <View style={styles.additionalChallengeIconContainer}>
                <Text style={styles.additionalChallengeIcon}>🚌</Text>
              </View>
              <View style={styles.additionalChallengeInfo}>
                <View style={styles.additionalChallengeTitleContainer}>
                  <Text style={styles.additionalChallengeTitle}>대중교통 이용하기</Text>
                  {isTransportCompleted && (
                    <View style={styles.completedBadge}>
                      <Text style={styles.completedBadgeText}>완료!</Text>
                    </View>
                  )}
                </View>
                <View style={[styles.additionalDifficultyBadge, { backgroundColor: '#ff9800' }]}>
                  <Text style={styles.additionalDifficultyText}>보통</Text>
                </View>
                <Text style={styles.additionalChallengeDescription}>
                  택시 대신 버스, 지하철로 이동해서 환경을 보호해보세요
                </Text>
              </View>
            </View>

            {!isTransportCompleted && (
              <View style={styles.additionalProgressSection}>
                <View style={styles.additionalProgressInfo}>
                  <Text style={styles.additionalProgressLabel}>진행률: {transportProgress}/1 회</Text>
                  <Text style={styles.additionalProgressIcon}>🚌</Text>
                </View>
                <TouchableOpacity 
                  style={styles.additionalActionButton}
                  onPress={handleTransportChallenge}
                >
                  <Text style={styles.additionalActionButtonText}>대중교통 이용하기</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.additionalRewardSection}>
              <View style={styles.additionalRewardInfo}>
                <View style={styles.additionalRewardTag}>
                  <Text style={styles.additionalRewardText}>교통</Text>
                </View>
                <Text style={styles.additionalPointsText}>500포인트</Text>
              </View>
              
              <View style={styles.additionalProgressBarContainer}>
                <Text style={styles.additionalProgressBarLabel}>진행률</Text>
                <View style={styles.additionalProgressBar}>
                  <View style={[
                    styles.additionalProgressFill, 
                    { 
                      width: isTransportCompleted ? '100%' : '0%',
                      backgroundColor: isTransportCompleted ? '#4caf50' : '#424242'
                    }
                  ]} />
                </View>
                <View style={styles.additionalProgressPercentageContainer}>
                  <Text style={styles.additionalProgressPercentage}>
                    {isTransportCompleted ? '100%' : '0%'}
                  </Text>
                  {isTransportCompleted && (
                    <Text style={styles.confettiIcon}></Text>
                  )}
                </View>
              </View>
            </View>

            {isTransportCompleted && (
              <View style={styles.completionMessage}>
                <Text style={styles.completionMessageText}>챌린지 완료! 축하합니다!</Text>
              </View>
            )}
          </View>

          {/* 다회용기 사용하기 챌린지 */}
          <View style={[
            styles.additionalChallengeCard, 
            { backgroundColor: isContainerCompleted ? '#e8f5e8' : '#fff' }
          ]}>
            <View style={styles.additionalChallengeHeader}>
              <View style={styles.additionalChallengeIconContainer}>
                <Text style={styles.additionalChallengeIcon}>🍽️</Text>
              </View>
              <View style={styles.additionalChallengeInfo}>
                <View style={styles.additionalChallengeTitleContainer}>
                  <Text style={styles.additionalChallengeTitle}>다회용기 사용하기</Text>
                  {isContainerCompleted && (
                    <View style={styles.completedBadge}>
                      <Text style={styles.completedBadgeText}>완료!</Text>
                    </View>
                  )}
                </View>
                <View style={[styles.additionalDifficultyBadge, { backgroundColor: '#f44336' }]}>
                  <Text style={styles.additionalDifficultyText}>어려움</Text>
                </View>
                <Text style={styles.additionalChallengeDescription}>
                  일회용 포장재 대신 다회용기를 사용해보세요
                </Text>
              </View>
            </View>

            {!isContainerCompleted && (
              <View style={styles.additionalProgressSection}>
                <View style={styles.additionalProgressInfo}>
                  <Text style={styles.additionalProgressLabel}>진행률: {containerProgress}/1 회</Text>
                  <Text style={styles.additionalProgressIcon}>🍽️</Text>
                </View>
                <TouchableOpacity 
                  style={styles.additionalActionButton}
                  onPress={handleContainerChallenge}
                >
                  <Text style={styles.additionalActionButtonText}>다회용기 사용하기</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.additionalRewardSection}>
              <View style={styles.additionalRewardInfo}>
                <View style={styles.additionalRewardTag}>
                  <Text style={styles.additionalRewardText}>식생활</Text>
                </View>
                <Text style={styles.additionalPointsText}>800포인트</Text>
              </View>
              
              <View style={styles.additionalProgressBarContainer}>
                <Text style={styles.additionalProgressBarLabel}>진행률</Text>
                <View style={styles.additionalProgressBar}>
                  <View style={[
                    styles.additionalProgressFill, 
                    { 
                      width: isContainerCompleted ? '100%' : '0%',
                      backgroundColor: isContainerCompleted ? '#4caf50' : '#424242'
                    }
                  ]} />
                </View>
                <View style={styles.additionalProgressPercentageContainer}>
                  <Text style={styles.additionalProgressPercentage}>
                    {isContainerCompleted ? '100%' : '0%'}
                  </Text>
                  {isContainerCompleted && (
                    <Text style={styles.confettiIcon}>🎉</Text>
                  )}
                </View>
              </View>
            </View>

            {isContainerCompleted && (
              <View style={styles.completionMessage}>
                <Text style={styles.completionMessageText}>챌린지 완료! 축하합니다!</Text>
              </View>
            )}
          </View>

          {/* 탄소 배출량 줄이기 챌린지 */}
          <View style={[
            styles.additionalChallengeCard, 
            { 
              backgroundColor: isCarbonFailed ? '#ffebee' : isCarbonCompleted ? '#e8f5e8' : '#fff', 
              marginBottom: 0 
            }
          ]}>
            <View style={styles.additionalChallengeHeader}>
              <View style={styles.additionalChallengeIconContainer}>
                <Text style={styles.additionalChallengeIcon}>🌍</Text>
              </View>
              <View style={styles.additionalChallengeInfo}>
                <View style={styles.additionalChallengeTitleContainer}>
                  <Text style={styles.additionalChallengeTitle}>탄소 배출량 줄이기</Text>
                  {isCarbonCompleted && (
                    <View style={styles.completedBadge}>
                      <Text style={styles.completedBadgeText}>성공!</Text>
                    </View>
                  )}
                  {isCarbonFailed && (
                    <View style={[styles.completedBadge, { backgroundColor: '#f44336' }]}>
                      <Text style={styles.completedBadgeText}>실패</Text>
                    </View>
                  )}
                </View>
                <View style={[styles.additionalDifficultyBadge, { backgroundColor: '#ff9800' }]}>
                  <Text style={styles.additionalDifficultyText}>보통</Text>
                </View>
                <Text style={styles.additionalChallengeDescription}>
                  24시간 동안 4.2kg 이하로 배출해보세요
                </Text>
              </View>
            </View>

            {/* 현재 탄소배출량 표시 */}
            <View style={styles.carbonEmissionSection}>
              <View style={styles.carbonEmissionHeader}>
                <Text style={styles.carbonEmissionLabel}>현재 탄소배출량</Text>
                <Text style={styles.carbonEmissionIcon}>🌍</Text>
              </View>
              <View style={styles.carbonEmissionDisplay}>
                <Text style={styles.carbonEmissionAmount}>
                  {currentCarbonEmission.toFixed(1)}kg / {CARBON_LIMIT}kg
                </Text>
                <Text style={[
                  styles.carbonEmissionStatus,
                  { color: currentCarbonEmission > CARBON_LIMIT ? '#f44336' : '#4caf50' }
                ]}>
                  {currentCarbonEmission > CARBON_LIMIT ? '한계 초과! 실패!' : '안전 범위'}
                </Text>
              </View>
            </View>

            <View style={styles.additionalRewardSection}>
              <View style={styles.additionalRewardInfo}>
                <View style={styles.additionalRewardTag}>
                  <Text style={styles.additionalRewardText}>전반</Text>
                </View>
                <Text style={styles.additionalPointsText}>1000포인트</Text>
              </View>
              
              <View style={styles.additionalProgressBarContainer}>
                <Text style={styles.additionalProgressBarLabel}>진행률</Text>
                <View style={styles.additionalProgressBar}>
                  <View style={[
                    styles.additionalProgressFill, 
                    { 
                      width: `${carbonProgress}%`,
                      backgroundColor: isCarbonFailed ? '#f44336' : isCarbonCompleted ? '#4caf50' : '#424242'
                    }
                  ]} />
                </View>
                <View style={styles.additionalProgressPercentageContainer}>
                  <Text style={styles.additionalProgressPercentage}>{carbonProgress}%</Text>
                  {isCarbonCompleted && (
                    <Text style={styles.confettiIcon}>🎉</Text>
                  )}
                  {isCarbonFailed && (
                    <Text style={styles.confettiIcon}>😢</Text>
                  )}
                </View>
              </View>
            </View>

            {isCarbonFailed && (
              <View style={[styles.completionMessage, { backgroundColor: '#f44336' }]}>
                <Text style={styles.completionMessageText}>4.2kg 초과로 챌린지 실패! 다음에 다시 도전해보세요!</Text>
              </View>
            )}

            {isCarbonCompleted && (
              <View style={styles.completionMessage}>
                <Text style={styles.completionMessageText}>챌린지 성공! 축하합니다!</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  headerSection: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'transparent',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  globeIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  banner: {
    backgroundColor: '#bbdefb',
    marginHorizontal: 0,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width:0, height:4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  characterImage: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  bannerTextContainer: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bannerText: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#424242',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#424242',
  },
  activeTabText: {
    color: '#fff',
  },
  challengeCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  challengeHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  challengeIconContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#424242',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  challengeIcon: {
    fontSize: 24,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  difficultyBadge: {
    backgroundColor: '#c8e6c9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  difficultyText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  challengeDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  stepsSection: {
    marginBottom: 20,
  },
  stepsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepsLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footprintIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  stepsLabelText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196f3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  refreshIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  refreshText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  refreshButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  stepsDisplay: {
    alignItems: 'center',
  },
  stepsCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  remainingSteps: {
    fontSize: 14,
    color: '#666',
  },
  rewardSection: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 16,
  },
  rewardInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rewardTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rewardIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  rewardText: {
    fontSize: 12,
    color: '#e65100',
    fontWeight: '500',
  },
  pointsText: {
    fontSize: 16,
    color: '#ff9800',
    fontWeight: 'bold',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#424242',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  // 추가 챌린지 카드 스타일
  additionalChallengesContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  additionalChallengeCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  additionalChallengeHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  additionalChallengeIconContainer: {
    width: 50,
    height: 50,
    backgroundColor: '#424242',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  additionalChallengeIcon: {
    fontSize: 20,
  },
  additionalChallengeInfo: {
    flex: 1,
  },
  additionalChallengeTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  additionalChallengeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  completedBadge: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedBadgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  additionalDifficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  additionalDifficultyText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  additionalChallengeDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  additionalProgressSection: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  additionalProgressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  additionalProgressLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  additionalProgressIcon: {
    fontSize: 16,
  },
  additionalActionButton: {
    backgroundColor: '#2196f3',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  additionalActionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  additionalRewardSection: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
  },
  additionalRewardInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  additionalRewardTag: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  additionalRewardText: {
    fontSize: 12,
    color: '#2c3e50',
    fontWeight: '500',
  },
  additionalPointsText: {
    fontSize: 14,
    color: '#ff9800',
    fontWeight: 'bold',
  },
  additionalProgressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  additionalProgressBarLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
    minWidth: 40,
  },
  additionalProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginRight: 8,
  },
  additionalProgressFill: {
    height: '100%',
    backgroundColor: '#424242',
    borderRadius: 3,
  },
  additionalProgressPercentage: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  completedProgressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  additionalProgressPercentageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confettiIcon: {
    fontSize: 12,
    marginLeft: 4,
  },
  completionMessage: {
    backgroundColor: '#4caf50',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 12,
    alignItems: 'center',
  },
  completionMessageText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  carbonEmissionSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  carbonEmissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  carbonEmissionLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  carbonEmissionIcon: {
    fontSize: 16,
  },
  carbonEmissionDisplay: {
    alignItems: 'center',
  },
  carbonEmissionAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  carbonEmissionStatus: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});

export default ChallengeScreen;
