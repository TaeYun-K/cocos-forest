import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';

interface UnifiedHeaderProps {
  title: string;
  rightContent?: React.ReactNode;
  style?: ViewStyle;
  // 추가 기능을 위한 props
  showRefresh?: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  showEco?: boolean;
  onEcoPress?: () => void;
}

const UnifiedHeader: React.FC<UnifiedHeaderProps> = ({
  title,
  rightContent,
  style,
  showRefresh = false,
  isRefreshing = false,
  onRefresh,
  showEco = false,
  onEcoPress
}) => {
  const defaultRightContent = (
    <>
      {showRefresh && (
        <TouchableOpacity
          style={[styles.headerIcon, isRefreshing && styles.headerIconDisabled]}
          onPress={onRefresh}
          disabled={isRefreshing}
        >
          <Text style={styles.headerIconText}>{isRefreshing ? '⏳' : '🔄'}</Text>
        </TouchableOpacity>
      )}
      {showEco && (
        <TouchableOpacity style={styles.headerIcon} onPress={onEcoPress}>
          <Text style={styles.headerIconText}>🌍</Text>
        </TouchableOpacity>
      )}
    </>
  );

  return (
    <View style={[styles.header, style]}>
      <Text style={styles.headerTitle}>{title}</Text>
      {(rightContent || showRefresh || showEco) && (
        <View style={styles.headerRight}>
          {rightContent || defaultRightContent}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ededed',
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

export default UnifiedHeader;