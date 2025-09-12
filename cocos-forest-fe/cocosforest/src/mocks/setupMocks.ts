// src/mocks/setupMocks.ts
import { mock } from '../api/axios';
import { dailyEmissionsData, generateMonthlyReportData, generateDayData } from './mockData';

// axios-mock-adapter가 있을 때만 설정
if (mock) {
  console.log('🔧 Setting up axios-mock-adapter...');

  // 일일 탄소 배출량 조회
  mock.onGet(/\/api\/dashboard\/daily-emissions\/(\d+)\/(\d+)/).reply((config) => {
    const matches = config.url?.match(/\/api\/dashboard\/daily-emissions\/(\d+)\/(\d+)/);
    if (!matches) {
      return [400, { error: 'Invalid URL format' }];
    }

    const year = matches[1];
    const month = matches[2];
    const yearMonth = `${year}-${String(month).padStart(2, '0')}`;
    
    console.log(`🎯 Mock Handler Hit: daily-emissions for ${yearMonth}`);
    
    // 기존 데이터가 있으면 사용, 없으면 해당 월의 일수만큼 랜덤 데이터 생성
    let emissions = dailyEmissionsData[yearMonth];
    
    if (!emissions) {
      console.log(`🔄 Generating random data for ${yearMonth}`);
      emissions = {};
      const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        emissions[day] = Math.floor(Math.random() * 26) + 25; // 25-50 사이 랜덤값
      }
    } else {
      console.log(`📊 Using existing data for ${yearMonth}`);
    }
    
    console.log('✅ Returning daily emissions data');
    return [200, {
      yearMonth,
      emissions
    }];
  });

  // 월별 리포트 조회
  mock.onGet(/\/api\/dashboard\/monthly-report\/(\d+)\/(\d+)/).reply((config) => {
    const matches = config.url?.match(/\/api\/dashboard\/monthly-report\/(\d+)\/(\d+)/);
    if (!matches) {
      return [400, { error: 'Invalid URL format' }];
    }

    const year = parseInt(matches[1]);
    const month = parseInt(matches[2]);
    
    console.log(`🎯 Mock Handler Hit: monthly-report for ${year}-${month}`);
    
    const reportData = generateMonthlyReportData(year, month);
    
    console.log('✅ Returning monthly report data');
    return [200, reportData];
  });

  // 특정 날짜 상세 데이터 조회
  mock.onGet(/\/api\/dashboard\/day-details\/(\d+)\/(\d+)\/(\d+)/).reply((config) => {
    const matches = config.url?.match(/\/api\/dashboard\/day-details\/(\d+)\/(\d+)\/(\d+)/);
    if (!matches) {
      return [400, { error: 'Invalid URL format' }];
    }

    const year = parseInt(matches[1]);
    const month = parseInt(matches[2]);
    const day = parseInt(matches[3]);
    
    console.log(`🎯 Mock Handler Hit: day-details for ${year}-${month}-${day}`);
    
    try {
      const dayData = generateDayData(year, month, day);
      console.log('✅ Day details generated successfully');
      console.log('📦 Returning data:', JSON.stringify(dayData, null, 2));
      
      return [200, dayData];
    } catch (error) {
      console.error('❌ Error generating day data:', error);
      return [500, { error: 'Failed to generate day data' }];
    }
  });

  console.log('✅ axios-mock-adapter setup complete');
}

export default mock;