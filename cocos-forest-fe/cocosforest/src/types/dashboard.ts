// src/types/dashboard.ts

// 월별 리포트 데이터 타입 (API 명세 기준)
export interface MonthlyReportData {
  userCardId: string;
  yearMonth: string; // API 응답에 포함됨
  currency: string;
  totals: {
    amountTotal: number;
    carbonTotalKg: number;
    transactionCount: number;
  };
  daily: Array<DailySummary>;
  byCategory: Array<CategoryData>;
}

// 일별 요약 데이터 타입 (API 명세 기준)
export interface DailySummary {
  date: string; // YYYY-MM-DD
  amountTotal: number;
  carbonTotalKg: number;
  transactionCount: number;
}

// 카테고리 데이터 타입 (API 명세 기준 + 클라이언트 확장)
export interface CategoryData {
  categoryId: string;
  categoryName: string;
  amountTotal: number;
  carbonTotalKg: number;
  ratioAmount: number;
  ratioCarbon: number;
  color?: string; // 클라이언트에서 추가하는 필드
}

// 일일 상세 데이터 타입 (실제 API 응답 기반)
export interface DayData {
  userCardId: string;
  date: string;
  currency: string;
  meta: {
    durationMs: number;
    error: any;
    lockAcquired: boolean;
    retry: number;
  };
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

// 카테고리별 월별 상세 데이터 타입 (task.md 응답 형식 기반)
export interface CategoryMonthlyDetails {
  userCardId: string;
  yearMonth: string;
  categoryId: string;
  categoryName: string;
  currency: string;
  totals: {
    amountTotal: number;
    carbonTotalKg: number;
    transactionCount: number;
  };
  transactions: Array<Transaction>;
}

// API 응답 래퍼 타입
export interface CategoryMonthlyDetailsResponse {
  httpStatus: string;
  isSuccess: boolean;
  message: string;
  code: number;
  result: CategoryMonthlyDetails;
}

// 결제 요청 데이터 타입
export interface PaymentRequest {
  merchantId: number;
  paymentBalance: number;
}

// 결제 응답 데이터 타입 (API 명세 기준)
export interface PaymentResult {
  transactionUniqueNo: string;
  categoryId: string;
  categoryName: string;
  merchantId: number;
  merchantName: string;
  transactionDate: string;
  transactionTime: string;
  paymentBalance: number;
  savedTransactionId: number;
  status: string;
}

// 결제 API 응답 타입
export interface PaymentResponse {
  httpStatus: string;
  isSuccess: boolean;
  message: string;
  code: number;
  result: PaymentResult;
}

