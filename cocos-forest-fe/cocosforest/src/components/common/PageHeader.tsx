import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';

interface PageHeaderProps {
  title: string;
  rightContent?: React.ReactNode;
  style?: ViewStyle;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, rightContent, style }) => {
  return (
    <View style={[styles.header, style]}>
      <Text style={styles.headerTitle}>{title}</Text>
      {rightContent && <View style={styles.headerRight}>{rightContent}</View>}
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
});

export default PageHeader;