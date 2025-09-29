import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useChallengeStore } from '../../store/challengeStore';

const ChallengeInfoCard: React.FC = () => {
  const { challenges } = useChallengeStore();

  // 미완료 챌린지 개수 계산
  const incompleteCount = challenges.filter(challenge => challenge.status !== 'completed').length;

  return (
    <View style={styles.challengeInfoCard}>
      <View style={styles.challengeInfoContent}>
        <Image
          source={require('../../../assets/coco-character.png')}
          style={styles.characterImage}
          resizeMode="contain"
        />
        <View style={styles.challengeInfoText}>
          <Text style={styles.challengeInfoTitle}>지구를 위한 작은 실천</Text>
          <Text style={styles.challengeInfoDescription}>
            매일 매일 챌린지를 완료하면서 환경을 보호하고 포인트도 받아보세요!
          </Text>
          <Text style={styles.challengeInfoStatus}>
            아직 완료하지 않은 챌린지가 <Text style={styles.incompleteCount}>{incompleteCount}</Text>개 있습니다.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
    marginBottom: 8,
  },
  challengeInfoStatus: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  incompleteCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EF4444',
  },
});

export default ChallengeInfoCard;
