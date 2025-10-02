import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { CompressionBenchmark } from '../utils/compressionBenchmark';
import { commonStyles, colors } from '../styles/commonStyles';

/**
 * 압축 벤치마크 테스트 화면
 *
 * 사용법:
 * 1. 이미지 선택
 * 2. 벤치마크 실행 버튼 클릭
 * 3. 콘솔에서 결과 확인
 */
const BenchmarkTestScreen = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1, // 원본 품질
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
        Alert.alert('이미지 선택 완료', '벤치마크 실행 버튼을 눌러주세요.');
      }
    } catch (error) {
      console.error('이미지 선택 오류:', error);
      Alert.alert('오류', '이미지를 선택할 수 없습니다.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('권한 필요', '카메라 권한이 필요합니다.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 1, // 원본 품질
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
        Alert.alert('사진 촬영 완료', '벤치마크 실행 버튼을 눌러주세요.');
      }
    } catch (error) {
      console.error('사진 촬영 오류:', error);
      Alert.alert('오류', '사진을 촬영할 수 없습니다.');
    }
  };

  const runBenchmark = async () => {
    if (!selectedImage) {
      Alert.alert('알림', '먼저 이미지를 선택하거나 촬영해주세요.');
      return;
    }

    setIsRunning(true);
    setResults([]);

    try {
      console.log('\n' + '='.repeat(60));
      console.log('📊 압축 벤치마크 시작');
      console.log('='.repeat(60));

      const benchmark = new CompressionBenchmark();
      const benchmarkResults = await benchmark.runBenchmark(selectedImage);

      setResults(benchmarkResults);

      // CSV 출력 (복사해서 엑셀에 붙여넣기 가능)
      console.log('\n📋 CSV 형식:');
      console.log(benchmark.getCSV());

      Alert.alert(
        '벤치마크 완료! 🎉',
        `${benchmarkResults.length}개 시나리오 테스트 완료\n\n콘솔에서 상세 결과를 확인하세요.`,
        [{ text: '확인' }]
      );
    } catch (error) {
      console.error('벤치마크 실행 오류:', error);
      Alert.alert('오류', '벤치마크 실행 중 오류가 발생했습니다.');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <SafeAreaView style={commonStyles.safeContainer}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>이미지 압축 벤치마크</Text>
        <Text style={styles.subtitle}>
          다양한 압축 설정의 성능을 비교합니다
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1단계: 이미지 선택</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={pickImage}
            disabled={isRunning}
          >
            <Text style={styles.buttonText}>📁 갤러리에서 선택</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={takePhoto}
            disabled={isRunning}
          >
            <Text style={styles.buttonText}>📷 사진 촬영</Text>
          </TouchableOpacity>

          {selectedImage && (
            <Text style={styles.selectedText}>✅ 이미지 선택됨</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2단계: 벤치마크 실행</Text>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              (!selectedImage || isRunning) && styles.disabledButton
            ]}
            onPress={runBenchmark}
            disabled={!selectedImage || isRunning}
          >
            <Text style={styles.primaryButtonText}>
              {isRunning ? '⏳ 실행 중...' : '🚀 벤치마크 시작'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.infoText}>
            💡 5가지 압축 설정을 테스트합니다{'\n'}
            결과는 콘솔에 자동 출력됩니다
          </Text>
        </View>

        {results.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>결과 요약</Text>

            {results.map((result, index) => (
              <View key={index} style={styles.resultCard}>
                <Text style={styles.resultTitle}>{result.scenario}</Text>
                <Text style={styles.resultText}>
                  압축 후: {(result.compressedSize / 1024).toFixed(0)} KB
                </Text>
                <Text style={styles.resultText}>
                  압축률: {result.compressionRatio.toFixed(1)}%
                </Text>
                <Text style={styles.resultText}>
                  처리 시간: {result.compressionTime} ms
                </Text>
              </View>
            ))}

            <Text style={styles.csvInfo}>
              📋 콘솔에서 CSV 형식 결과를 확인하세요{'\n'}
              (복사해서 엑셀에 붙여넣기 가능)
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.guideTitle}>📖 사용 가이드</Text>
          <Text style={styles.guideText}>
            • 다양한 크기의 이미지로 테스트하세요{'\n'}
            • 콘솔 로그에서 상세 결과를 확인하세요{'\n'}
            • CSV 데이터를 엑셀에 복사하여 분석하세요{'\n'}
            • 평균 압축률을 포트폴리오에 기재하세요
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  button: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: colors.textSecondary,
    opacity: 0.5,
  },
  selectedText: {
    color: colors.primary,
    textAlign: 'center',
    fontWeight: '500',
    marginTop: 8,
  },
  infoText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  resultCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  resultText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  csvInfo: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 18,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  guideText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});

export default BenchmarkTestScreen;
