// src/types/dashboard.ts

// 일일 탄소 배출량 타입
export interface DailyEmissions {
  yearMonth: string;
  emissions: { [key: number]: number };
}

// 월별 리포트 데이터 타입
export interface MonthlyReportData {
  cardId: string;
  yearMonth: string;
  currency: string;
  totals: {
    amountTotal: number;
    carbonTotalKg: number;
    transactionCount: number;
    daysActive: number;
    avgPerDayAmount: number;
    avgPerDayCarbonKg: number;
  };
  byCategory: Array<CategoryData>;
}

// 카테고리 데이터 타입
export interface CategoryData {
  categoryId: string;
  categoryName: string;
  amountTotal: number;
  carbonTotalKg: number;
  ratioAmount: number;
  ratioCarbon: number;
  color: string;
}

// 일일 상세 데이터 타입
export interface DayData {
  cardId: string;
  date: string;
  fresh: boolean;
  lastSyncedAt: string;
  syncStatus: string;
  totals: DayTotals;
  transactions: Array<Transaction>;
}

// 일일 합계 데이터 타입
export interface DayTotals {
  amountTotal: number;
  carbonTotalKg: number;
  transactionCount: number;
}

// 거래 데이터 타입
export interface Transaction {
  externalTransactionId: string;
  approvedAt: string;
  txDate: string;
  txTime: string;
  amountKrw: number;
  status: string;
  merchantName: string;
  categoryId: string;
  categoryName: string;
  cardLast4: string;
  issuerCode: string;
  cardName: string;
  source: string;
  carbonKg: number;
  carbonCoefId: string;
}

// API 응답 공통 타입
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

// 에러 타입
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}