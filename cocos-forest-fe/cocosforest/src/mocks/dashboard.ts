// src/mocks/dashboard.ts
import { http, HttpResponse } from 'msw';

// 일일 탄소 배출량 목업 데이터
const dailyEmissionsData: { [key: string]: { [key: number]: number } } = {
  '2025-01': {
    1: 32, 2: 45, 3: 28, 4: 52, 5: 38, 6: 41, 7: 29, 8: 35, 9: 48, 10: 31,
    11: 44, 12: 36, 13: 27, 14: 39, 15: 33, 16: 42, 17: 30, 18: 46, 19: 34,
    20: 37, 21: 29, 22: 43, 23: 31, 24: 38, 25: 35, 26: 40, 27: 32, 28: 44,
    29: 36, 30: 28, 31: 41
  },
  '2025-02': {
    1: 35, 2: 42, 3: 29, 4: 48, 5: 33, 6: 39, 7: 26, 8: 45, 9: 37, 10: 30,
    11: 41, 12: 34, 13: 28, 14: 46, 15: 32, 16: 38, 17: 27, 18: 43, 19: 36,
    20: 31, 21: 44, 22: 29, 23: 40, 24: 35, 25: 47, 26: 33, 27: 42, 28: 38
  }
};

// 월별 리포트 목업 데이터
const generateMonthlyReportData = (year: number, month: number) => {
  return {
    cardId: "1003-a139e9f23f1a4cc",
    yearMonth: `${year}-${String(month).padStart(2, '0')}`,
    currency: "KRW",
    totals: {
      amountTotal: 1243500,
      carbonTotalKg: 18.42,
      transactionCount: 73,
      daysActive: 20,
      avgPerDayAmount: 62175,
      avgPerDayCarbonKg: 0.92
    },
    byCategory: [
      { 
        categoryId: "CG-주유", 
        categoryName: "주유", 
        amountTotal: 350000, 
        carbonTotalKg: 7.19, 
        ratioAmount: 0.281, 
        ratioCarbon: 0.390,
        color: '#ef4444' 
      },
      { 
        categoryId: "CG-카페", 
        categoryName: "카페", 
        amountTotal: 210000, 
        carbonTotalKg: 3.42, 
        ratioAmount: 0.169, 
        ratioCarbon: 0.186,
        color: '#f97316' 
      },
      { 
        categoryId: "CG-음식", 
        categoryName: "음식점", 
        amountTotal: 285000, 
        carbonTotalKg: 2.98, 
        ratioAmount: 0.229, 
        ratioCarbon: 0.162,
        color: '#eab308' 
      },
      { 
        categoryId: "CG-쇼핑", 
        categoryName: "쇼핑", 
        amountTotal: 198500, 
        carbonTotalKg: 2.31, 
        ratioAmount: 0.159, 
        ratioCarbon: 0.125,
        color: '#15803d' 
      },
      { 
        categoryId: "CG-교통", 
        categoryName: "교통", 
        amountTotal: 200000, 
        carbonTotalKg: 2.52, 
        ratioAmount: 0.161, 
        ratioCarbon: 0.137,
        color: '#6366f1' 
      }
    ]
  };
};

// 특정 날짜 상세 데이터 생성 함수
const generateDayData = (year: number, month: number, day: number) => {
  const yearMonth = `${year}-${String(month).padStart(2, '0')}`;
  const totalEmission = dailyEmissionsData[yearMonth]?.[day] || 30;
  
  return {
    cardId: "1003-a139e9f23f1a4cc",
    date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    fresh: true,
    lastSyncedAt: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T15:30:12+09:00`,
    syncStatus: "DONE",
    totals: {
      amountTotal: Math.round(totalEmission * 1000),
      carbonTotalKg: totalEmission,
      transactionCount: Math.round(totalEmission / 10) || 1
    },
    transactions: [
      {
        externalTransactionId: "20",
        approvedAt: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T09:44:31+09:00`,
        txDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        txTime: "09:44:31",
        amountKrw: Math.round(totalEmission * 400),
        status: "APPROVED",
        merchantName: "스타벅스 서면점",
        categoryId: "CG-카페",
        categoryName: "카페",
        cardLast4: "6479",
        issuerCode: "1005",
        cardName: "신한 TRAVEL",
        source: "SSAFY",
        carbonKg: Math.round(totalEmission * 0.4 * 100) / 100,
        carbonCoefId: "COEF-CAFE-2025"
      },
      {
        externalTransactionId: "21",
        approvedAt: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T12:15:22+09:00`,
        txDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        txTime: "12:15:22",
        amountKrw: Math.round(totalEmission * 300),
        status: "APPROVED",
        merchantName: "지하철 2호선",
        categoryId: "CG-교통",
        categoryName: "교통",
        cardLast4: "6479",
        issuerCode: "1005",
        cardName: "신한 TRAVEL",
        source: "SSAFY",
        carbonKg: Math.round(totalEmission * 0.3 * 100) / 100,
        carbonCoefId: "COEF-TRANSPORT-2025"
      },
      {
        externalTransactionId: "22",
        approvedAt: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T18:30:15+09:00`,
        txDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        txTime: "18:30:15",
        amountKrw: Math.round(totalEmission * 300),
        status: "APPROVED",
        merchantName: "이마트 24",
        categoryId: "CG-쇼핑",
        categoryName: "쇼핑",
        cardLast4: "6479",
        issuerCode: "1005",
        cardName: "신한 TRAVEL",
        source: "SSAFY",
        carbonKg: Math.round(totalEmission * 0.3 * 100) / 100,
        carbonCoefId: "COEF-RETAIL-2025"
      }
    ]
  };
};

export const dashboardHandlers = [
  // 일일 탄소 배출량 조회
  http.get('/api/dashboard/daily-emissions/:year/:month', ({ params }) => {
    const { year, month } = params as { year: string; month: string };
    const yearMonth = `${year}-${String(month).padStart(2, '0')}`;
    const emissions = dailyEmissionsData[yearMonth] || {};
    
    return HttpResponse.json({
      yearMonth,
      emissions
    });
  }),

  // 월별 리포트 조회
  http.get('/api/dashboard/monthly-report/:year/:month', ({ params }) => {
    const { year, month } = params as { year: string; month: string };
    const reportData = generateMonthlyReportData(parseInt(year), parseInt(month));
    
    return HttpResponse.json(reportData);
  }),

  // 특정 날짜 상세 데이터 조회
  http.get('/api/dashboard/day-details/:year/:month/:day', ({ params }) => {
    const { year, month, day } = params as { year: string; month: string; day: string };
    const dayData = generateDayData(parseInt(year), parseInt(month), parseInt(day));
    
    return HttpResponse.json(dayData);
  })
];