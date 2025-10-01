// src/types/finance.ts

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

export interface UserProfile {
  nickname: string;
  currentBalance: number;
}

export interface LinkageResponse {
  linkageId: number;
  userId: number;
  orgCode: string;
  fintechAppNo: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  httpStatus: string;
  isSuccess: boolean;
  message: string;
  code: string;
  result: T;
}
