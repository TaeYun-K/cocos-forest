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
  Image,
  Modal
} from 'react-native';
// @ts-ignore
import Pedometer from 'react-native-pedometer';
import { commonStyles, colors } from '../styles/commonStyles';
import { fetchTodayData } from '../api/dashboard';
import type { Transaction } from '../types/dashboard';
import { useChallengeStore } from '../store/challengeStore';
import type { Challenge } from '../types/challenge';
import { healthService } from '../services/healthService';
import TumblerVerificationModal from '../components/challenge/TumblerVerificationModal';
import { challengeApi } from '../api/challenge';
import { challengeDetectionService } from '../services/challengeDetectionService';

const ChallengeScreen = () => {
  const {
    challenges,
    todayChallenges,
    isLoading,
    initializeChallenges,
    loadTodayChallenges,
    checkAttendance,
    updateSteps,
    checkTransportUsage,
    verifyTumbler,
    claimReward,
    claimChallengeReward,
  } = useChallengeStore();

  const [isStepsLoading, setIsStepsLoading] = useState(false);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [showTumblerModal, setShowTumblerModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // 현재 날짜를 가져오는 함수
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    return `${year}년 ${month}월 ${day}일`;
  };

  // 챌린지 감지 상태
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

  // 챌린지 초기화 및 백엔드에서 상태 로드
  useEffect(() => {
    const loadChallengeStatus = async () => {
      try {
        // 새로운 API를 사용하여 오늘의 챌린지 로드
        await loadTodayChallenges();
      } catch (error) {
        console.error('Failed to load challenge status:', error);
        // 오류 시 로컬 초기화
        initializeChallenges();
      }
    };

    loadChallengeStatus();
  }, []);

  // Health Service 사용 가능 여부 확인
  useEffect(() => {
    const checkHealthAvailability = async () => {
      try {
        const isAvailable = healthService.isHealthDataAvailable();
        setIsPedometerAvailable(isAvailable);
      } catch (error) {
        console.log('Health service not available:', error);
        setIsPedometerAvailable(false);
      }
    };

    checkHealthAvailability();
  }, []);

  // 걸음수 업데이트
  useEffect(() => {
    const fetchTodaySteps = async () => {
      if (!isPedometerAvailable) return;

      try {
        const stepData = await healthService.getTodaySteps();
        updateSteps(stepData.steps);
      } catch (error) {
        console.log('Error fetching steps:', error);
      }
    };

    fetchTodaySteps();
  }, [isPedometerAvailable]);

  // 결제내역을 활용한 챌린지 자동 감지
  useEffect(() => {
    const detectChallengesFromTransactions = async () => {
      try {
        console.log('🔍 결제내역 기반 챌린지 감지 시작');
        
        // 챌린지 감지 서비스를 사용하여 오늘의 거래 내역 분석
        const detectionResult = await challengeDetectionService.detectTodayChallenges();
        
        // 감지 결과를 상태에 저장
        setChallengeDetectionResult(detectionResult);
        
        // 대중교통 이용이 감지되면 챌린지 완료 처리
        if (detectionResult.transportUsed) {
          console.log('🚌 대중교통 이용 감지됨 - 챌린지 완료 처리');
          checkTransportUsage(true);
        }
        
        // 카페 이용이 감지되면 텀블러 챌린지 활성화 (OCR 인증은 별도)
        if (detectionResult.cafeUsed) {
          console.log('☕ 카페 이용 감지됨 - 텀블러 챌린지 활성화');
          // 카페 이용이 감지되었지만 OCR 인증은 사용자가 직접 해야 함
          // verifyTumbler(true); // 이 부분은 제거 - 사용자가 직접 인증해야 함
        }
        
      } catch (error) {
        console.error('❌ 챌린지 감지 중 에러:', error);
      }
    };

    detectChallengesFromTransactions();
  }, []);

  // 출석체크 핸들러
  const handleAttendanceCheck = async () => {
    try {
      const response = await challengeApi.checkAttendance();
      if (response.success) {
        checkAttendance(); // 로컬 상태도 업데이트
        Alert.alert('출석체크 완료!', `${response.pointsEarned || 100}포인트를 획득했습니다!`);
      } else {
        Alert.alert('오류', response.message || '출석체크 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Attendance check error:', error);
      Alert.alert('오류', '출석체크 중 오류가 발생했습니다.');
    }
  };

  // 걸음수 새로고침
  const handleRefreshSteps = async () => {
    if (!isPedometerAvailable) {
      Alert.alert('알림', '이 기기에서는 걸음수 측정이 지원되지 않습니다.');
      return;
    }

    setIsStepsLoading(true);
    try {
      const stepData = await healthService.getTodaySteps();
      
      // 백엔드로 걸음수 데이터 전송
      const response = await challengeApi.updateSteps(stepData.steps);
      if (response.success) {
        updateSteps(stepData.steps); // 로컬 상태도 업데이트
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

  // 보상받기 핸들러
  const handleClaimReward = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setShowRewardModal(true);
  };

  // 보상 확인 핸들러
  const handleConfirmReward = async () => {
    if (selectedChallenge) {
      try {
        // 해당 챌린지의 instanceId 찾기
        const challengeInstance = todayChallenges.find(c => c.challengeId === selectedChallenge.id);
        if (!challengeInstance) {
          Alert.alert('오류', '챌린지 정보를 찾을 수 없습니다.');
          return;
        }

        const success = await claimChallengeReward(challengeInstance.instanceId);
        
        if (success) {
          Alert.alert('보상 수령 완료!', `${selectedChallenge.points}포인트를 획득했습니다!`);
        } else {
          Alert.alert('오류', '보상 수령 중 오류가 발생했습니다.');
        }
      } catch (error) {
        console.error('Reward claim error:', error);
        Alert.alert('오류', '보상 수령 중 오류가 발생했습니다.');
      }
    }
    setShowRewardModal(false);
    setSelectedChallenge(null);
  };

  // 텀블러 인증 핸들러
  const handleTumblerVerification = () => {
    setShowTumblerModal(true);
  };

  // 텀블러 인증 성공 핸들러
  const handleTumblerVerificationSuccess = async () => {
    try {
      const response = await challengeApi.verifyTumbler();
      if (response.success) {
        verifyTumbler(true); // 로컬 상태도 업데이트
        setShowTumblerModal(false);
        Alert.alert('인증 완료!', `텀블러 인증이 완료되었습니다! ${response.pointsEarned}포인트를 획득했습니다!`);
      } else {
        Alert.alert('인증 실패', response.message || '텀블러 인증에 실패했습니다.');
      }
    } catch (error) {
      console.error('Tumbler verification error:', error);
      Alert.alert('오류', '텀블러 인증 중 오류가 발생했습니다.');
    }
  };

  // 결제내역 새로고침 핸들러
  const handleRefreshTransactions = async () => {
    setIsRefreshing(true);
    try {
      console.log('🔄 결제내역 새로고침 시작');
      
      // 챌린지 감지 서비스를 사용하여 오늘의 거래 내역 재분석
      const detectionResult = await challengeDetectionService.detectTodayChallenges();
      
      // 감지 결과를 상태에 저장
      setChallengeDetectionResult(detectionResult);
      
      // 대중교통 이용이 감지되면 챌린지 완료 처리
      if (detectionResult.transportUsed) {
        console.log('🚌 대중교통 이용 감지됨 - 챌린지 완료 처리');
        checkTransportUsage(true);
      }
      
      Alert.alert('새로고침 완료', '결제내역을 다시 확인했습니다.');
      
    } catch (error) {
      console.error('❌ 결제내역 새로고침 중 에러:', error);
      Alert.alert('오류', '결제내역을 새로고침하는 중 오류가 발생했습니다.');
    } finally {
      setIsRefreshing(false);
    }
  };



  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView style={commonStyles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>환경 챌린지</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={[styles.headerIcon, isRefreshing && styles.headerIconDisabled]}
              onPress={handleRefreshTransactions}
              disabled={isRefreshing}
            >
              <Text style={styles.headerIconText}>{isRefreshing ? '⏳' : '🔄'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon}>
              <Text style={styles.headerIconText}>🌍</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Challenge Info Card */}
        <View style={styles.challengeInfoCard}>
          <View style={styles.challengeInfoContent}>
            <Image 
              source={require('../../assets/coco-character.png')} 
              style={styles.characterImage}
              resizeMode="contain"
            />
            <View style={styles.challengeInfoText}>
              <Text style={styles.challengeInfoTitle}>지구를 위한 작은 실천</Text>
              <Text style={styles.challengeInfoDescription}>
                매일 매일 챌린지를 완료하면서 환경을 보호하고 포인트도 받아보세요!
              </Text>
            </View>
          </View>
        </View>

        {/* 탭 네비게이션 */}
        <View style={styles.tabContainer}>
          <TouchableOpacity style={[styles.tab, styles.activeTab]}>
            <Text style={[styles.tabText, styles.activeTabText]}>
              진행 중 ({getCurrentDate()})
            </Text>
          </TouchableOpacity>
        </View>

        {/* 챌린지 카드들 */}
        <View style={styles.challengesContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>챌린지를 불러오는 중...</Text>
            </View>
          ) : (
            challenges.map((challenge) => (
                <View 
              key={challenge.id} 
                  style={[
                styles.challengeCard,
                { 
                  backgroundColor: challenge.status === 'completed' ? '#e8f5e8' : '#fff',
                  borderColor: challenge.status === 'completed' ? '#4caf50' : '#e0e0e0',
                  borderWidth: challenge.status === 'completed' ? 2 : 1,
                }
              ]}
            >
              <View style={styles.challengeHeader}>
                <View style={styles.challengeIconContainer}>
                  <Text style={styles.challengeIcon}>{challenge.icon}</Text>
              </View>
                <View style={styles.challengeInfo}>
                  <View style={styles.challengeTitleContainer}>
                    <Text style={styles.challengeTitle}>{challenge.title}</Text>
                    {challenge.status === 'completed' && (
                    <View style={styles.completedBadge}>
                      <Text style={styles.completedBadgeText}>완료!</Text>
                    </View>
                  )}
                </View>
                  <View style={[
                    styles.difficultyBadge, 
                    { 
                      backgroundColor: challenge.difficulty === 'easy' ? '#4caf50' : 
                                     challenge.difficulty === 'medium' ? '#ff9800' : '#f44336'
                    }
                  ]}>
                    <Text style={styles.difficultyText}>
                      {challenge.difficulty === 'easy' ? '쉬움' : 
                       challenge.difficulty === 'medium' ? '보통' : '어려움'}
                  </Text>
                </View>
                  <Text style={styles.challengeDescription}>{challenge.description}</Text>
              </View>
            </View>

              {/* 챌린지별 특별 섹션 */}
              {challenge.type === 'attendance' && (
                <View style={styles.specialSection}>
                  <TouchableOpacity 
                    style={[
                      styles.actionButton,
                      challenge.status === 'completed' && styles.actionButtonDisabled
                    ]}
                    onPress={handleAttendanceCheck}
                    disabled={challenge.status === 'completed'}
                  >
                    <Text style={styles.actionButtonText}>
                      {challenge.status === 'completed' ? '출석체크 완료' : '출석체크 하기'}
                    </Text>
                  </TouchableOpacity>
              </View>
            )}

              {challenge.type === 'steps' && (
                <View style={styles.specialSection}>
                  <View style={styles.stepsInfo}>
                    <Text style={styles.stepsLabel}>현재 걸음수: {challenge.progress.toLocaleString()} / {challenge.maxProgress.toLocaleString()} 보</Text>
                    <TouchableOpacity 
                      style={[styles.refreshButton, isStepsLoading && styles.refreshButtonDisabled]}
                      onPress={handleRefreshSteps}
                      disabled={isStepsLoading}
                    >
                      <Text style={styles.refreshIcon}>{isStepsLoading ? '⏳' : '🔄'}</Text>
                      <Text style={styles.refreshText}>{isStepsLoading ? '로딩중...' : '새로고침'}</Text>
                    </TouchableOpacity>
              </View>
                    </View>
                  )}

              {challenge.type === 'transport' && (
                <View style={styles.specialSection}>
                  <Text style={styles.autoCheckText}>
                    {challenge.status === 'completed' 
                      ? '대중교통 이용 완료!' 
                      : challengeDetectionResult.transportUsed 
                        ? '대중교통 이용이 감지되었습니다! 챌린지를 완료하세요.'
                        : '소비내역을 확인하여 자동 판단됩니다'
                    }
                  </Text>
                  {challengeDetectionResult.transportTransactions.length > 0 && (
                    <View style={styles.detectedTransactions}>
                      <Text style={styles.detectedTransactionsTitle}>감지된 거래:</Text>
                      {challengeDetectionResult.transportTransactions.slice(0, 3).map((tx, index) => (
                        <Text key={index} style={styles.detectedTransactionItem}>
                          • {tx.merchantName} ({tx.amountKrw.toLocaleString()}원)
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {challenge.type === 'tumbler' && (
                <View style={styles.specialSection}>
                  <Text style={styles.autoCheckText}>
                    {challenge.status === 'completed' 
                      ? '텀블러 인증 완료!' 
                      : challengeDetectionResult.cafeUsed 
                        ? '카페 이용이 감지되었습니다! 텀블러 인증을 진행하세요.'
                        : '카페 이용 후 텀블러 인증이 필요합니다'
                    }
                  </Text>
                  {challengeDetectionResult.cafeTransactions.length > 0 && (
                    <View style={styles.detectedTransactions}>
                      <Text style={styles.detectedTransactionsTitle}>감지된 카페 거래:</Text>
                      {challengeDetectionResult.cafeTransactions.slice(0, 3).map((tx, index) => (
                        <Text key={index} style={styles.detectedTransactionItem}>
                          • {tx.merchantName} ({tx.amountKrw.toLocaleString()}원)
                        </Text>
                      ))}
                    </View>
                  )}
                  {challenge.status !== 'completed' && challengeDetectionResult.cafeUsed && (
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={handleTumblerVerification}
                    >
                      <Text style={styles.actionButtonText}>텀블러 인증하기</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* 보상 섹션 */}
              <View style={styles.rewardSection}>
                <View style={styles.rewardInfo}>
                  <View style={styles.rewardTag}>
                    <Text style={styles.rewardText}>{challenge.points}포인트</Text>
              </View>
                  {challenge.status === 'completed' && !challenge.rewardClaimed && (
                    <TouchableOpacity 
                      style={styles.claimButton}
                      onPress={() => handleClaimReward(challenge)}
                    >
                      <Text style={styles.claimButtonText}>보상받기</Text>
                    </TouchableOpacity>
                  )}
                  {challenge.rewardClaimed && (
                    <Text style={styles.claimedText}>보상 수령 완료</Text>
                  )}
            </View>

                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { 
                          width: `${(challenge.progress / challenge.maxProgress) * 100}%`,
                          backgroundColor: challenge.status === 'completed' ? '#4caf50' : '#007AFF'
                        }
                      ]} 
                    />
                </View>
                  <Text style={styles.progressPercentage}>
                    {Math.round((challenge.progress / challenge.maxProgress) * 100)}%
                  </Text>
                </View>
              </View>
            </View>
          ))
          )}
              </View>
      </ScrollView>

      {/* 보상 모달 */}
      <Modal
        visible={showRewardModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowRewardModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>보상 수령</Text>
            <Text style={styles.modalMessage}>
              {selectedChallenge?.title} 챌린지를 완료하여 {selectedChallenge?.points}포인트를 획득했습니다!
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowRewardModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={handleConfirmReward}
              >
                <Text style={styles.modalConfirmButtonText}>수령하기</Text>
              </TouchableOpacity>
              </View>
          </View>
        </View>
      </Modal>

      {/* 텀블러 인증 모달 */}
      <TumblerVerificationModal
        visible={showTumblerModal}
        onClose={() => setShowTumblerModal(false)}
        onSuccess={handleTumblerVerificationSuccess}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    padding: 8,
  },
  headerIconDisabled: {
    opacity: 0.5,
  },
  headerIconText: {
    fontSize: 20,
  },
  challengeInfoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  challengeInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  characterImage: {
    width: 50,
    height: 50,
    marginRight: 16,
  },
  challengeInfoText: {
    flex: 1,
  },
  challengeInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  challengeInfoDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  challengesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  challengeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  challengeHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  challengeIconContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#f0f0f0',
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
  challengeTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  challengeTitle: {
    fontSize: 18,
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
  difficultyBadge: {
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
  specialSection: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  actionButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  stepsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepsLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
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
  autoCheckText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
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
    backgroundColor: '#fff3e0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  rewardText: {
    fontSize: 14,
    color: '#e65100',
    fontWeight: '600',
  },
  claimButton: {
    backgroundColor: '#ff9800',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  claimButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  claimedText: {
    fontSize: 12,
    color: '#4caf50',
    fontWeight: '500',
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
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    marginHorizontal: 20,
    minWidth: 280,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  modalCancelButton: {
    backgroundColor: '#f5f5f5',
  },
  modalCancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  modalConfirmButton: {
    backgroundColor: '#007AFF',
  },
  modalConfirmButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // 감지된 거래 정보 스타일
  detectedTransactions: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f0f8ff',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  detectedTransactionsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  detectedTransactionItem: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  // 로딩 스타일
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
});

export default ChallengeScreen;
