import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { Challenge } from '../../types/challenge';
import type { Transaction } from '../../types/dashboard';
import ChallengeCard from './ChallengeCard';

interface ChallengeListProps {
  challenges: Challenge[];
  isLoading: boolean;
  challengeDetectionResult: {
    transportUsed: boolean;
    cafeUsed: boolean;
    transportTransactions: Transaction[];
    cafeTransactions: Transaction[];
  };
  isAttendanceLoading: boolean;
  isStepsLoading: boolean;
  tumblerVerificationFailed: boolean;
  onInitializeChallenges: () => void;
  onAttendanceCheck: () => void;
  onRefreshSteps: () => void;
  onTumblerVerification: () => void;
  onClaimReward: (challenge: Challenge) => void;
}

const ChallengeList: React.FC<ChallengeListProps> = ({
  challenges,
  isLoading,
  challengeDetectionResult,
  isAttendanceLoading,
  isStepsLoading,
  tumblerVerificationFailed,
  onInitializeChallenges,
  onAttendanceCheck,
  onRefreshSteps,
  onTumblerVerification,
  onClaimReward,
}) => {
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>챌린지를 불러오는 중...</Text>
      </View>
    );
  }

  if (challenges.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>챌린지를 초기화하는 중...</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={onInitializeChallenges}
        >
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.challengesContainer}>
      {challenges.map((challenge) => (
        <ChallengeCard
          key={challenge.id}
          challenge={challenge}
          challengeDetectionResult={challengeDetectionResult}
          isAttendanceLoading={isAttendanceLoading}
          isStepsLoading={isStepsLoading}
          tumblerVerificationFailed={tumblerVerificationFailed}
          onAttendanceCheck={onAttendanceCheck}
          onRefreshSteps={onRefreshSteps}
          onTumblerVerification={onTumblerVerification}
          onClaimReward={onClaimReward}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  challengesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
    alignSelf: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ChallengeList;

