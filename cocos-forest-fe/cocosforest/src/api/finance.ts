// src/api/finance.ts
import apiClient from './axios';
import type {
  Bank,
  AccountProduct,
  UserAccount,
  CardProduct,
  UserCard,
  ConnectCardRequest,
  CreateAccountRequest,
  CreateAccountResponse,
  LinkageResponse,
  ApiResponse
} from '../types/finance';

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
  cardData: ConnectCardRequest
): Promise<UserCard> => {
  const response = await apiClient.post<ApiResponse<UserCard>>(
    `/api/finance/user-cards`,
    cardData
  );
  return response.data.result;
};

/**
 * SSAFY 금융 연동 사용자 등록 여부 확인
 */
export const checkUserLinkage = async (): Promise<boolean> => {
  const response = await apiClient.post<ApiResponse<boolean>>(
    '/api/finance/ssafy/linkages/search'
  );
  return response.data.result;
};

/**
 * SSAFY 금융 연동 사용자 등록
 */
export const registerUserLinkage = async (): Promise<LinkageResponse> => {
  const response = await apiClient.post<ApiResponse<LinkageResponse>>(
    '/api/finance/ssafy/linkages/register'
  );
  return response.data.result;
};
