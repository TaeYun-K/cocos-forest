import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator
} from 'react-native';
import type { UserProfile } from '../../types/finance';
import { colors } from '../../styles/commonStyles';

interface ProfileHeaderProps {
  userProfile: UserProfile | null;
  points: number;
  treeCount: number;
  isLoading: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  userProfile,
  points,
  treeCount,
  isLoading
}) => {
  return (
    <View style={styles.profileCard}>
      <View style={styles.avatarContainer}>
        <Image
          source={require('../../../assets/coco-character.png')}
          style={styles.avatar}
          resizeMode="contain"
        />
      </View>
      <View style={styles.profileInfo}>
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <>
            <Text style={styles.userName}>
              {userProfile?.nickname || '사용자'}
            </Text>
            <Text style={styles.userTitle}>에코 워리어</Text>
            <View style={styles.levelContainer}>
              <Text style={styles.pointsText}>{points.toLocaleString()} P</Text>
              <Text style={styles.treeCountText}>나무 {treeCount}그루</Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  profileCard: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 4,
  },
  userTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pointsText: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '600',
  },
  treeCountText: {
    fontSize: 14,
    color: colors.successDark,
    fontWeight: '600',
  },
});

export default ProfileHeader;