// src/api/finance.ts
import apiClient from './axios';

// 타입 정의
export interface Bank {
  bankCode: string;
  bankName: string;
}

export interface AccountProduct {
  productId: number;
  accountTypeUniqueNo: string;
  bankCode: string;
  bankName: string;
  accountTypeCode: string;
  accountTypeName: string;
  accountName: string;
  accountDescription: string;
  accountType: 'DOMESTIC';
  createdAt: string;
}

export interface UserAccount {
  accountId: number;
  userId: number;
  accountNo: string;
  bankCode: string;
  accountTypeUniqueNo: string;
  currency: string;
  currencyName: string;
  status: 'ACTIVE';
  createdAt: string;
}

export interface CardProduct {
  productId: number;
  issuerCode: string;
  cardUniqueNo: string;
  name: string;
  description: string;
  baselinePerformance: number;
  maxBenefitLimit: number;
}

export interface CreateAccountRequest {
  accountTypeUniqueNo: string;
}

export interface CreateAccountResponse {
  bankCode: string;
  accountNo: string;
  currency: string;
  currencyName: string;
  createdAt: string;
}

export interface UserCard {
  userCardId: number;
  userId: number;
  productId: number;
  cardUniqueNo: string;
  issuerCode: string;
  issuerName: string;
  cardName: string;
  cardMasked: string;
  last4: string;
  expiryMM: string;
  withdrawalAccountNo: string;
  withdrawalDay: string;
  baselinePerformance: number;
  maxBenefitLimit: number;
  cardDescription: string;
  status: 'ACTIVE';
  createdAt: string;
}

export interface ConnectCardRequest {
  productId: number;
  withdrawalAccountNo: string;
  withdrawalDate: string;
}

export interface ApiResponse<T> {
  httpStatus: string;
  isSuccess: boolean;
  message: string;
  code: string;
  result: T;
}

/**
 * 백엔드 서버 헬스체크
 */
export const healthCheck = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get('/api/finance/banks', { timeout: 5000 });
    return response.status === 200;
  } catch (error) {
    console.error('백엔드 서버 헬스체크 실패:', error);
    return false;
  }
};

/**
 * 은행 목록 조회
 */
export const fetchBanks = async (): Promise<Bank[]> => {
  const response = await apiClient.get<ApiResponse<Bank[]>>('/api/finance/banks');
  return response.data.result;
};

/**
 * 특정 은행의 계좌 상품 목록 조회
 */
export const fetchAccountProducts = async (bankCode: string): Promise<AccountProduct[]> => {
  const response = await apiClient.get<ApiResponse<AccountProduct[]>>(`/api/finance/account-products/banks/${bankCode}`);
  return response.data.result;
};

/**
 * 사용자 계좌 목록 조회
 * 주의: API 변경됨 - 파라미터 없음, 백엔드에서 하드코딩된 사용자 사용
 */
export const fetchUserAccounts = async (userId?: number): Promise<UserAccount[]> => {
  // userId 파라미터는 더 이상 사용되지 않음 (API 스펙 변경)
  const response = await apiClient.get<ApiResponse<UserAccount[]>>(`/api/finance/accounts/user`);
  return response.data.result;
};

/**
 * 카드 상품 목록 조회
 */
export const fetchCardProducts = async (): Promise<CardProduct[]> => {
  const response = await apiClient.get<ApiResponse<CardProduct[]>>('/api/finance/card-products');
  return response.data.result;
};

/**
 * 수시입출금 계좌 생성
 * 주의: 백엔드에서 userId 파라미터를 받지 않고 하드코딩(userId=1) 사용함
 */
export const createDemandDepositAccount = async (
  userId: number, 
  accountData: CreateAccountRequest
): Promise<CreateAccountResponse> => {
  // userId 파라미터는 백엔드에서 무시됨 (Controller에서 받지 않음)
  const response = await apiClient.post<ApiResponse<CreateAccountResponse>>(
    `/api/finance/accounts/demand-deposit`,
    accountData
  );
  return response.data.result;
};

/**
 * 사용자 연결된 카드 목록 조회
 */
export const fetchUserCards = async (): Promise<UserCard[]> => {
  const response = await apiClient.get<ApiResponse<UserCard[]>>('/api/finance/user-cards');
  return response.data.result;
};

/**
 * 카드 연결 (사용자에게 카드 등록)
 */
export const connectUserCard = async (
  cardData: ConnectCardRequest,
  userId: number = 1
): Promise<UserCard> => {
  const response = await apiClient.post<ApiResponse<UserCard>>(
    `/api/finance/user-cards?userId=${userId}`,
    cardData
  );
  return response.data.result;
};
