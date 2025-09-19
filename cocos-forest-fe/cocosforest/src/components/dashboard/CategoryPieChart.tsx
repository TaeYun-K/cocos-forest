import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import type { CategoryData } from '../../types/dashboard';

interface CategoryPieChartProps {
  categories: CategoryData[];
  title?: string;
}

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({
  categories,
  title = "탄소 배출량 비율"
}) => {
  const size = 200;
  const strokeWidth = 40;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  // 데이터 정렬 (배출량 기준 내림차순)
  const sortedCategories = [...categories]
    .sort((a, b) => b.carbonTotalKg - a.carbonTotalKg)
    .filter(cat => cat.carbonTotalKg > 0);

  // 각도 계산
  const totalEmission = sortedCategories.reduce((sum, cat) => sum + cat.carbonTotalKg, 0);
  let currentAngle = -90; // 12시 방향부터 시작

  const createPath = (startAngle: number, endAngle: number, outerRadius: number) => {
    const start = polarToCartesian(center, center, outerRadius, endAngle);
    const end = polarToCartesian(center, center, outerRadius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
      "M", start.x, start.y,
      "A", outerRadius, outerRadius, 0, largeArcFlag, 0, end.x, end.y,
      "L", center, center,
      "Z"
    ].join(" ");
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.chartContainer}>
        <Svg height={size} width={size} style={styles.chart}>
          {sortedCategories.map((category) => {
            const percentage = category.carbonTotalKg / totalEmission;
            const angle = percentage * 360;
            const endAngle = currentAngle + angle;

            const path = createPath(currentAngle, endAngle, radius + strokeWidth / 2);

            currentAngle = endAngle;

            return (
              <Path
                key={category.categoryId}
                d={path}
                fill={category.color}
                opacity={0.9}
              />
            );
          })}

          {/* 중앙 원 */}
          <Circle
            cx={center}
            cy={center}
            r={radius - strokeWidth / 2}
            fill="#ffffff"
            stroke="#f3f4f6"
            strokeWidth={2}
          />

        </Svg>

        {/* 중앙 텍스트 (절대 위치) */}
        <View style={styles.centerText}>
          <Text style={styles.centerTitle}>총 배출량</Text>
          <Text style={styles.centerValue}>{totalEmission.toFixed(1)}kg</Text>
        </View>

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
  chart: {
    marginBottom: 16,
  },
  centerText: {
    position: 'absolute',
    top: 84, // (200 / 2) - 16
    left: 0,
    right: 0,
    alignItems: 'center',
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
});