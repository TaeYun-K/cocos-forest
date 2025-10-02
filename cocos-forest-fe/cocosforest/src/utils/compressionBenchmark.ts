import * as ImageManipulator from 'expo-image-manipulator';
import { File } from 'expo-file-system';

interface BenchmarkScenario {
  name: string;
  compress: number;
  width: number;
}

interface BenchmarkResult {
  scenario: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  compressionTime: number;
  quality: number;
  width: number;
}

/**
 * 이미지 압축 벤치마크 도구
 *
 * 사용법:
 * ```typescript
 * const benchmark = new CompressionBenchmark();
 * const results = await benchmark.runBenchmark(imageUri);
 * benchmark.printReport();
 * ```
 */
export class CompressionBenchmark {
  private results: BenchmarkResult[] = [];

  /**
   * 테스트 시나리오 정의
   */
  private scenarios: BenchmarkScenario[] = [
    { name: '초고품질 (OCR 최적)', compress: 0.9, width: 2048 },
    { name: '고품질', compress: 0.85, width: 1536 },
    { name: '균형형 (권장)', compress: 0.7, width: 1024 },
    { name: '고압축', compress: 0.6, width: 1024 },
    { name: '초고압축', compress: 0.5, width: 800 },
  ];

  /**
   * 벤치마크 실행
   */
  async runBenchmark(imageUri: string): Promise<BenchmarkResult[]> {
    console.log('\n🧪 이미지 압축 벤치마크 시작');
    console.log('━'.repeat(60));

    // 원본 파일 정보 (최신 File API 사용)
    const originalFile = new File(imageUri);
    const originalInfo = originalFile.info();
    const originalSize = originalInfo?.size || 0;

    console.log('📁 원본 파일:', (originalSize / 1024).toFixed(2), 'KB\n');

    this.results = [];

    for (const scenario of this.scenarios) {
      console.log(`\n🔬 테스트: ${scenario.name}`);

      const startTime = Date.now();

      try {
        // 압축 실행
        const compressed = await ImageManipulator.manipulateAsync(
          imageUri,
          [{ resize: { width: scenario.width } }],
          {
            compress: scenario.compress,
            format: ImageManipulator.SaveFormat.JPEG,
          }
        );

        const compressionTime = Date.now() - startTime;

        // 압축된 파일 크기 측정 (최신 File API 사용)
        const compressedFile = new File(compressed.uri);
        const compressedInfo = compressedFile.info();
        const compressedSize = compressedInfo?.size || 0;

        const compressionRatio = ((1 - compressedSize / originalSize) * 100);

        const result: BenchmarkResult = {
          scenario: scenario.name,
          originalSize,
          compressedSize,
          compressionRatio,
          compressionTime,
          quality: scenario.compress,
          width: scenario.width,
        };

        this.results.push(result);
        this.logSingleResult(result);

        // 압축된 임시 파일 삭제 (저장 공간 절약)
        await compressedFile.delete();

      } catch (error) {
        console.error(`❌ ${scenario.name} 실패:`, error);
      }
    }

    console.log('\n' + '━'.repeat(60));
    this.printReport();

    return this.results;
  }

  /**
   * 개별 결과 로그
   */
  private logSingleResult(result: BenchmarkResult): void {
    console.log('├─ 압축 후:', (result.compressedSize / 1024).toFixed(2), 'KB');
    console.log('├─ 압축률:', result.compressionRatio.toFixed(1), '%');
    console.log('├─ 처리 시간:', result.compressionTime, 'ms');
    console.log('└─ 설정: 품질', result.quality, '/ 폭', result.width, 'px');
  }

  /**
   * 최종 리포트 출력
   */
  printReport(): void {
    if (this.results.length === 0) {
      console.log('⚠️  벤치마크 결과가 없습니다.');
      return;
    }

    console.log('\n📊 종합 리포트');
    console.log('━'.repeat(60));

    // 표 헤더
    console.log('\n시나리오          | 파일크기 | 압축률 | 시간   | 품질');
    console.log('-'.repeat(60));

    // 각 결과 출력
    this.results.forEach(result => {
      const scenario = result.scenario.padEnd(15);
      const size = `${(result.compressedSize / 1024).toFixed(0)}KB`.padEnd(8);
      const ratio = `${result.compressionRatio.toFixed(0)}%`.padEnd(6);
      const time = `${result.compressionTime}ms`.padEnd(6);
      const quality = `${(result.quality * 100).toFixed(0)}%`;

      console.log(`${scenario} | ${size} | ${ratio} | ${time} | ${quality}`);
    });

    // 추천 시나리오
    console.log('\n🏆 추천 시나리오:');

    const fastest = this.results.reduce((prev, curr) =>
      prev.compressionTime < curr.compressionTime ? prev : curr
    );
    console.log(`   ⚡ 가장 빠름: ${fastest.scenario} (${fastest.compressionTime}ms)`);

    const bestCompression = this.results.reduce((prev, curr) =>
      prev.compressionRatio > curr.compressionRatio ? prev : curr
    );
    console.log(`   💾 최고 압축: ${bestCompression.scenario} (${bestCompression.compressionRatio.toFixed(1)}%)`);

    const balanced = this.results.find(r => r.scenario.includes('균형'));
    if (balanced) {
      console.log(`   ⚖️  균형형: ${balanced.scenario} (${(balanced.compressedSize / 1024).toFixed(0)}KB, ${balanced.compressionTime}ms)`);
    }

    // 총 절약량 계산
    const avgCompressedSize = this.results.reduce((sum, r) => sum + r.compressedSize, 0) / this.results.length;
    const avgOriginalSize = this.results[0]?.originalSize || 0;
    const avgSavings = avgOriginalSize - avgCompressedSize;

    console.log('\n📈 평균 성과:');
    console.log(`   압축 전: ${(avgOriginalSize / 1024).toFixed(2)} KB`);
    console.log(`   압축 후: ${(avgCompressedSize / 1024).toFixed(2)} KB`);
    console.log(`   절약량: ${(avgSavings / 1024).toFixed(2)} KB (${((avgSavings / avgOriginalSize) * 100).toFixed(1)}%)`);

    console.log('\n' + '━'.repeat(60));
  }

  /**
   * 결과를 JSON 형태로 반환
   */
  getResults(): BenchmarkResult[] {
    return this.results;
  }

  /**
   * 결과를 CSV 형태로 출력
   */
  getCSV(): string {
    if (this.results.length === 0) {
      return '';
    }

    const header = 'Scenario,Original Size (KB),Compressed Size (KB),Compression Ratio (%),Time (ms),Quality,Width (px)';
    const rows = this.results.map(r =>
      `${r.scenario},${(r.originalSize / 1024).toFixed(2)},${(r.compressedSize / 1024).toFixed(2)},${r.compressionRatio.toFixed(1)},${r.compressionTime},${(r.quality * 100).toFixed(0)},${r.width}`
    );

    return [header, ...rows].join('\n');
  }
}
