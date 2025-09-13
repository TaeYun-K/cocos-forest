// src/mocks/mockData.ts
// 고정 cardId
const CARD_ID = "1003-a139e9f23f1a4cc";

// 일일 탄소 배출량 목업 데이터 (3개 색상 구분을 위해 조정)
// 0.4 미만: 낮음(초록), 0.4-0.8: 보통(노랑), 0.8 이상: 높음(빨강)
export const dailyEmissionsData: { [key: string]: { [key: number]: number } } = {
  '2025-01': {
    1: 0.32, 2: 0.85, 3: 0.28, 4: 1.02, 5: 0.38, 6: 0.61, 7: 0.29, 8: 0.35, 9: 0.88, 10: 0.31,
    11: 0.94, 12: 0.36, 13: 0.27, 14: 0.79, 15: 0.33, 16: 0.72, 17: 0.30, 18: 0.96, 19: 0.34,
    20: 0.67, 21: 0.29, 22: 0.83, 23: 0.31, 24: 0.58, 25: 0.35, 26: 0.70, 27: 0.32, 28: 0.84,
    29: 0.36, 30: 0.28, 31: 0.81
  },
  '2025-02': {
    1: 0.35, 2: 0.82, 3: 0.29, 4: 0.98, 5: 0.33, 6: 0.69, 7: 0.26, 8: 0.85, 9: 0.37, 10: 0.30,
    11: 0.91, 12: 0.34, 13: 0.28, 14: 0.86, 15: 0.32, 16: 0.68, 17: 0.27, 18: 0.93, 19: 0.36,
    20: 0.31, 21: 0.84, 22: 0.29, 23: 0.70, 24: 0.35, 25: 0.97, 26: 0.33, 27: 0.82, 28: 0.38
  },
  '2025-09': {
    1: 0.38, 2: 0.81, 3: 0.35, 4: 0.86, 5: 0.32, 6: 0.94, 7: 0.29, 8: 0.59, 9: 0.33, 10: 0.72,
    11: 0.37, 12: 0.31, 13: 0.85, 14: 0.28, 15: 0.70, 16: 0.34, 17: 0.97, 18: 0.36, 19: 0.30,
    20: 0.83, 21: 0.38, 22: 0.32, 23: 0.71, 24: 0.35, 25: 1.08, 26: 0.29, 27: 0.84, 28: 0.37,
    29: 0.31, 30: 0.69
  }
};

// 월별 리포트 목업 데이터 생성 함수 (새로운 API 명세 기반)
export const generateMonthlyReportData = (year: number, month: number) => {
  const yearMonth = `${year}-${String(month).padStart(2, '0')}`;
  const emissions = dailyEmissionsData[yearMonth] || {};

  // daily 배열 생성
  const daysInMonth = new Date(year, month, 0).getDate();
  const daily = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const carbonTotalKg = emissions[day] || (Math.random() * 0.8 + 0.2); // 0.2-1.0 사이
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    daily.push({
      date,
      amountTotal: Math.round(carbonTotalKg * 50000), // kg당 50,000원으로 계산
      carbonTotalKg: Math.round(carbonTotalKg * 100) / 100,
      transactionCount: Math.max(1, Math.round(carbonTotalKg * 5)),
      fresh: true,
      lastSyncedAt: `${date}T15:30:12+09:00`
    });
  }

  // 총합 계산
  const totalCarbon = daily.reduce((sum, day) => sum + day.carbonTotalKg, 0);
  const totalAmount = daily.reduce((sum, day) => sum + day.amountTotal, 0);
  const totalTransactions = daily.reduce((sum, day) => sum + day.transactionCount, 0);
  const activeDays = daily.filter(day => day.transactionCount > 0).length;

  return {
    cardId: CARD_ID,
    yearMonth,
    currency: "KRW",
    totals: {
      amountTotal: totalAmount,
      carbonTotalKg: Math.round(totalCarbon * 100) / 100,
      transactionCount: totalTransactions,
      daysActive: activeDays,
      avgPerDayAmount: Math.round(totalAmount / Math.max(activeDays, 1)),
      avgPerDayCarbonKg: Math.round((totalCarbon / Math.max(activeDays, 1)) * 100) / 100
    },
    daily,
    byCategory: [
      {
        categoryId: "CG-주유",
        categoryName: "주유",
        amountTotal: Math.round(totalAmount * 0.281),
        carbonTotalKg: Math.round(totalCarbon * 0.390 * 100) / 100,
        ratioAmount: 0.281,
        ratioCarbon: 0.390,
        color: '#ef4444'
      },
      {
        categoryId: "CG-카페",
        categoryName: "카페",
        amountTotal: Math.round(totalAmount * 0.169),
        carbonTotalKg: Math.round(totalCarbon * 0.186 * 100) / 100,
        ratioAmount: 0.169,
        ratioCarbon: 0.186,
        color: '#f97316'
      },
      {
        categoryId: "CG-음식",
        categoryName: "음식점",
        amountTotal: Math.round(totalAmount * 0.229),
        carbonTotalKg: Math.round(totalCarbon * 0.162 * 100) / 100,
        ratioAmount: 0.229,
        ratioCarbon: 0.162,
        color: '#eab308'
      },
      {
        categoryId: "CG-쇼핑",
        categoryName: "쇼핑",
        amountTotal: Math.round(totalAmount * 0.159),
        carbonTotalKg: Math.round(totalCarbon * 0.125 * 100) / 100,
        ratioAmount: 0.159,
        ratioCarbon: 0.125,
        color: '#15803d'
      },
      {
        categoryId: "CG-교통",
        categoryName: "교통",
        amountTotal: Math.round(totalAmount * 0.161),
        carbonTotalKg: Math.round(totalCarbon * 0.137 * 100) / 100,
        ratioAmount: 0.161,
        ratioCarbon: 0.137,
        color: '#6366f1'
      }
    ]
  };
};

// 특정 날짜 상세 데이터 생성 함수 (새로운 API 명세 기반)
export const generateDayData = (year: number, month: number, day: number) => {
  const yearMonth = `${year}-${String(month).padStart(2, '0')}`;
  const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  // kg 단위로 조정 (0.2-1.2 사이)
  const totalEmission = dailyEmissionsData[yearMonth]?.[day] || (Math.random() * 1.0 + 0.2);

  return {
    cardId: CARD_ID,
    date,
    fresh: true,
    lastSyncedAt: `${date}T15:30:12+09:00`,
    syncStatus: "DONE",
    totals: {
      amountTotal: Math.round(totalEmission * 50000), // kg당 50,000원으로 계산
      carbonTotalKg: Math.round(totalEmission * 100) / 100,
      transactionCount: Math.max(1, Math.round(totalEmission * 5))
    },
    transactions: [
      {
        externalTransactionId: "20",
        approvedAt: `${date}T09:44:31+09:00`,
        txDate: date,
        txTime: "09:44:31",
        amountKrw: Math.round(totalEmission * 20000),
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
        approvedAt: `${date}T12:15:22+09:00`,
        txDate: date,
        txTime: "12:15:22",
        amountKrw: Math.round(totalEmission * 15000),
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
        approvedAt: `${date}T18:30:15+09:00`,
        txDate: date,
        txTime: "18:30:15",
        amountKrw: Math.round(totalEmission * 15000),
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