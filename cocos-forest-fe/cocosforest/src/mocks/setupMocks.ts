// src/mocks/setupMocks.ts
import { mock } from '../api/axios';
import { generateMonthlyReportData, generateDayData } from './mockData';

// 고정 cardId
const CARD_ID = "1003-a139e9f23f1a4cc";

// axios-mock-adapter가 있을 때만 설정
if (mock) {
  console.log('🔧 Setting up axios-mock-adapter...');

  // Daily API: /api/cards/{cardId}/transactions/day
  mock.onGet(new RegExp(`/api/cards/${CARD_ID}/transactions/day`)).reply((config) => {
    const params = config.params || {};
    const { date, force = false } = params;

    console.log(`🎯 Mock Handler Hit: Daily API for date ${date}, force: ${force}`);

    if (!date) {
      return [400, { error: 'date parameter is required' }];
    }

    try {
      // date를 파싱 (YYYY-MM-DD)
      const [year, month, day] = date.split('-').map(Number);
      const dayData = generateDayData(year, month, day);

      console.log('✅ Daily data generated successfully');
      console.log('📦 Returning data:', JSON.stringify(dayData, null, 2));

      return [200, dayData];
    } catch (error) {
      console.error('❌ Error generating daily data:', error);
      return [500, { error: 'Failed to generate daily data' }];
    }
  });

  // Monthly API: /api/cards/{cardId}/transactions/month-summary
  mock.onGet(new RegExp(`/api/cards/${CARD_ID}/transactions/month-summary`)).reply((config) => {
    const params = config.params || {};
    const { yearMonth } = params;

    console.log(`🎯 Mock Handler Hit: Monthly API for yearMonth ${yearMonth}`);

    if (!yearMonth) {
      return [400, { error: 'yearMonth parameter is required' }];
    }

    try {
      // yearMonth를 파싱 (YYYY-MM)
      const [year, month] = yearMonth.split('-').map(Number);
      const monthlyData = generateMonthlyReportData(year, month);

      console.log('✅ Monthly data generated successfully');
      console.log('📦 Returning data:', JSON.stringify(monthlyData, null, 2));

      return [200, monthlyData];
    } catch (error) {
      console.error('❌ Error generating monthly data:', error);
      return [500, { error: 'Failed to generate monthly data' }];
    }
  });

  // 기존 호환성을 위한 레거시 엔드포인트들 (필요시 제거 가능)
  mock.onGet(/\/api\/dashboard\/daily-emissions\/(\d+)\/(\d+)/).reply((config) => {
    const matches = config.url?.match(/\/api\/dashboard\/daily-emissions\/(\d+)\/(\d+)/);
    if (!matches) return [400, { error: 'Invalid URL format' }];

    const year = parseInt(matches[1]);
    const month = parseInt(matches[2]);
    const yearMonth = `${year}-${String(month).padStart(2, '0')}`;

    console.log(`🎯 Legacy Handler: daily-emissions for ${yearMonth}`);

    const monthlyData = generateMonthlyReportData(year, month);
    const emissions: { [key: number]: number } = {};

    monthlyData.daily.forEach(dayData => {
      const day = parseInt(dayData.date.split('-')[2]);
      emissions[day] = dayData.carbonTotalKg;
    });

    return [200, { emissions }];
  });

  mock.onGet(/\/api\/dashboard\/monthly-report\/(\d+)\/(\d+)/).reply((config) => {
    const matches = config.url?.match(/\/api\/dashboard\/monthly-report\/(\d+)\/(\d+)/);
    if (!matches) return [400, { error: 'Invalid URL format' }];

    const year = parseInt(matches[1]);
    const month = parseInt(matches[2]);

    console.log(`🎯 Legacy Handler: monthly-report for ${year}-${month}`);

    return [200, generateMonthlyReportData(year, month)];
  });

  console.log('✅ axios-mock-adapter setup complete');
}

export default mock;