import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { CategoryData } from '../../types/dashboard';

interface CategoryItemProps {
  item: CategoryData;
  index: number;
}

export const CategoryItem: React.FC<CategoryItemProps> = ({ item, index }) => {
  return (
    <View style={styles.categoryItemDetailed}>
      <View style={styles.categoryHeader}>
        <View style={styles.categoryLeft}>
          <View style={[styles.categoryColor, { backgroundColor: item.color }]} />
          <Text style={styles.categoryName}>{item.categoryName}</Text>
          {index === 0 && (
            <View style={styles.topEmitterBadge}>
              <Text style={styles.topEmitterText}>최다 배출</Text>
            </View>
          )}
        </View>
        <View style={styles.categoryRight}>
          <Text style={styles.categoryAmount}>{item.carbonTotalKg}kg CO₂</Text>
          <Text style={styles.categoryPercentage}>
            {Math.round(item.ratioCarbon * 100)}%
          </Text>
        </View>
      </View>

      <View style={styles.categoryDetails}>
        <View style={styles.categoryDetailRow}>
          <Text style={styles.categoryDetailLabel}>결제금액</Text>
          <Text style={styles.categoryDetailValue}>
            ₩{item.amountTotal.toLocaleString()}
          </Text>
        </View>
        <View style={styles.categoryDetailRow}>
          <Text style={styles.categoryDetailLabel}>금액 비중</Text>
          <Text style={styles.categoryDetailValue}>
            {Math.round(item.ratioAmount * 100)}%
          </Text>
        </View>
      </View>

      {/* 탄소 배출량 비중 바 */}
      <View style={styles.emissionBar}>
        <View
          style={[
            styles.emissionFill,
            {
              width: `${item.ratioCarbon * 100}%`,
              backgroundColor: item.color
            }
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  categoryItemDetailed: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  topEmitterBadge: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  topEmitterText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#d97706',
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  categoryPercentage: {
    fontSize: 12,
    color: '#6b7280',
  },
  categoryDetails: {
    gap: 8,
    marginBottom: 12,
  },
  categoryDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryDetailLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  categoryDetailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
  },
  emissionBar: {
    height: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  emissionFill: {
    height: '100%',
    borderRadius: 3,
  },
});