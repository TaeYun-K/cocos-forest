import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import type { CategoryData } from '../../types/dashboard';

interface CategoryPieChartProps {
  categories: CategoryData[];
  title?: string;
}

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({
  categories,
  title = "탄소 배출량 비율"
}) => {
  // 데이터 정렬 및 필터링 (배출량 기준 내림차순)
  const sortedCategories = useMemo(() => {
    return [...categories]
      .sort((a, b) => b.carbonTotalKg - a.carbonTotalKg)
      .filter(cat => cat.carbonTotalKg > 0);
  }, [categories]);

  // 총 배출량 계산
  const totalEmission = useMemo(() => {
    return sortedCategories.reduce((sum, cat) => sum + cat.carbonTotalKg, 0);
  }, [sortedCategories]);

  // Gifted Charts용 데이터 변환
  const pieData = useMemo(() => {
    const mainCategories = sortedCategories.slice(0, 5);
    const otherCategories = sortedCategories.slice(5);

    const chartData = mainCategories.map((category, index) => ({
      value: category.carbonTotalKg,
      color: category.color,
      text: `${category.categoryName}\n${category.carbonTotalKg.toFixed(1)}kg`,
      focused: index === 0, // 첫 번째 항목을 약간 분리
    }));

    // 기타 카테고리가 있으면 추가
    if (otherCategories.length > 0) {
      const otherTotal = otherCategories.reduce((sum, cat) => sum + cat.carbonTotalKg, 0);
      chartData.push({
        value: otherTotal,
        color: '#d1d5db',
        text: `기타 ${otherCategories.length}개\n${otherTotal.toFixed(1)}kg`,
        focused: false,
      });
    }

    return chartData;
  }, [sortedCategories]);

  if (totalEmission === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>데이터가 없습니다</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.chartContainer}>
        <PieChart
          data={pieData}
          radius={90}
          innerRadius={50}
          centerLabelComponent={() => (
            <View style={styles.centerLabel}>
              <Text style={styles.centerTitle}>총 배출량</Text>
              <Text style={styles.centerValue}>{totalEmission.toFixed(1)}kg</Text>
            </View>
          )}
          focusOnPress
          isAnimated
          animationDuration={800}
          strokeColor="#ffffff"
          strokeWidth={2}
          showTooltip
          textColor="#ffffff"
          textSize={10}
          showText={false} // 차트 내부 텍스트는 숨김 (범례 사용)
        />

        {/* 범례 */}
        <View style={styles.legend}>
          {sortedCategories.slice(0, 5).map((category) => (
            <View key={category.categoryId} style={styles.legendItem}>
              <View
                style={[styles.legendColor, { backgroundColor: category.color }]}
              />
              <View style={styles.legendTextContainer}>
                <Text style={styles.legendName}>{category.categoryName}</Text>
                <Text style={styles.legendValue}>
                  {category.carbonTotalKg.toFixed(1)}kg ({Math.round(category.ratioCarbon * 100)}%)
                </Text>
              </View>
            </View>
          ))}

          {sortedCategories.length > 5 && (
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#d1d5db' }]} />
              <View style={styles.legendTextContainer}>
                <Text style={styles.legendName}>기타 {sortedCategories.length - 5}개</Text>
                <Text style={styles.legendValue}>
                  {sortedCategories.slice(5).reduce((sum, cat) => sum + cat.carbonTotalKg, 0).toFixed(1)}kg
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  centerLabel: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  centerValue: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  legend: {
    width: '100%',
    gap: 8,
    marginTop: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  legendTextContainer: {
    flex: 1,
  },
  legendName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  legendValue: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
  },
});