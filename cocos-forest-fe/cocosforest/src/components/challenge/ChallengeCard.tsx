import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Challenge } from '../../types/challenge';
import type { Transaction } from '../../types/dashboard';
import { colors } from '../../styles/commonStyles';
import ChallengeSpecialSection from './ChallengeSpecialSection';

interface ChallengeCardProps {
  challenge: Challenge;
  challengeDetectionResult: {
    transportUsed: boolean;
    cafeUsed: boolean;
    transportTransactions: Transaction[];
    cafeTransactions: Transaction[];
  };
  isAttendanceLoading: boolean;
  isStepsLoading: boolean;
  tumblerVerificationFailed: boolean;
  onAttendanceCheck: () => void;
  onRefreshSteps: () => void;
  onTumblerVerification: () => void;
  onClaimReward: (challenge: Challenge) => void;
}

// 이모지를 벡터 아이콘으로 매핑
const getIconName = (emoji: string): keyof typeof Ionicons.glyphMap => {
  const iconMap: { [key: string]: keyof typeof Ionicons.glyphMap } = {
    '📅': 'calendar-outline',
    '🚶‍♂️': 'walk-outline',
    '🚌': 'bus-outline',
    '☕': 'cafe-outline',
  };
  return iconMap[emoji] || 'help-circle-outline';
};

const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  challengeDetectionResult,
  isAttendanceLoading,
  isStepsLoading,
  tumblerVerificationFailed,
  onAttendanceCheck,
  onRefreshSteps,
  onTumblerVerification,
  onClaimReward,
}) => {
  return (
    <View 
      style={[
        styles.challengeCard,
        {
          backgroundColor: challenge.status === 'completed' ? colors.greenLight : colors.white,
          borderColor: challenge.status === 'completed' ? colors.primary : colors.gray200,
          borderWidth: challenge.status === 'completed' ? 2 : 1,
        }
      ]}
    >
      <View style={styles.challengeHeader}>
        <View style={styles.challengeIconContainer}>
          <Ionicons
            name={getIconName(challenge.icon)}
            size={28}
            color="#374151"
            style={styles.challengeIcon}
          />
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
              backgroundColor: challenge.difficulty === 'easy' ? colors.primary :
                             challenge.difficulty === 'medium' ? colors.success : '#047857'
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

      <ChallengeSpecialSection
        challenge={challenge}
        challengeDetectionResult={challengeDetectionResult}
        isAttendanceLoading={isAttendanceLoading}
        isStepsLoading={isStepsLoading}
        tumblerVerificationFailed={tumblerVerificationFailed}
        onAttendanceCheck={onAttendanceCheck}
        onRefreshSteps={onRefreshSteps}
        onTumblerVerification={onTumblerVerification}
      />

      <View style={styles.rewardSection}>
        <View style={styles.rewardInfo}>
          <View style={styles.rewardTag}>
            <Text style={styles.rewardText}>{challenge.points}포인트</Text>
          </View>
          {!challenge.rewardClaimed && (
            <TouchableOpacity 
              style={[
                styles.claimButton,
                challenge.status !== 'completed' && styles.claimButtonDisabled
              ]}
              onPress={challenge.status === 'completed' ? () => onClaimReward(challenge) : undefined}
              disabled={challenge.status !== 'completed'}
            >
              <Text style={[
                styles.claimButtonText,
                challenge.status !== 'completed' && styles.claimButtonTextDisabled
              ]}>
                보상받기
              </Text>
            </TouchableOpacity>
          )}
          {challenge.rewardClaimed && (
            <Text style={styles.claimedText}>보상 수령 완료</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: '#f8fafb',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  challengeIcon: {
    // 벡터 아이콘 스타일 (fontSize 제거)
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
    backgroundColor: colors.primary,
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
    backgroundColor: colors.greenLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  rewardText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  claimButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
    alignSelf: 'center',
  },
  claimButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  claimButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  claimButtonTextDisabled: {
    color: '#999',
  },
  claimedText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
});

export default ChallengeCard;

