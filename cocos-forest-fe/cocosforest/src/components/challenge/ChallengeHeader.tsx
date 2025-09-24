import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ChallengeHeaderProps {
  isRefreshing: boolean;
  onRefresh: () => void;
}

const ChallengeHeader: React.FC<ChallengeHeaderProps> = ({
  isRefreshing,
  onRefresh,
}) => {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>환경 챌린지</Text>
      <View style={styles.headerRight}>
        <TouchableOpacity 
          style={[styles.headerIcon, isRefreshing && styles.headerIconDisabled]}
          onPress={onRefresh}
          disabled={isRefreshing}
        >
          <Text style={styles.headerIconText}>{isRefreshing ? '⏳' : '🔄'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerIcon}>
          <Text style={styles.headerIconText}>🌍</Text>
        </TouchableOpacity>
      </View>
    </View>
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
});

export default ChallengeHeader;

