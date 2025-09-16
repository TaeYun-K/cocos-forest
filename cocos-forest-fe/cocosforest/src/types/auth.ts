// 로그인 폼 데이터 타입
export interface LoginForm {
  email: string;
  password: string;
}

// 회원가입 단계별 폼 타입들
export interface SignupStep1Form {
  nickname: string;
  email: string;
  verificationCode: string;
  phoneNumber: string;
}

export interface SignupStep2Form {
  password: string;
  passwordConfirm: string;
}

export interface SignupStep3Form {
  agreements: {
    terms: boolean;
    privacy: boolean;
    marketing: boolean;
  };
}

// 전체 회원가입 폼 타입
export interface SignupForm extends SignupStep1Form, SignupStep2Form {
  agreements: SignupStep3Form['agreements'];
}

// 사용자 정보 타입
export interface User {
  id: string;
  email: string;
  nickname: string;
  phoneNumber: string;
}

// API 응답 타입
export interface AuthResponse {
  user: User;
  token: string;
}

// 회원가입 단계 타입
export type SignupStep = 1 | 2 | 3;

// 인증 상태 타입
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// 폼 유효성 검사 결과 타입
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// API 에러 타입
export interface ApiError {
  success: false;
  message: string;
  code?: string;
}

// // 네비게이션 파라미터 타입들
// export type AuthStackParamList = {
//   Login: undefined;
//   SignupStep1: undefined;
//   SignupStep2: {
//     step1Data: SignupStep1Form;
//   };
//   SignupStep3: {
//     step1Data: SignupStep1Form;
//     step2Data: SignupStep2Form;
//   };
// };

// // 메인 네비게이션 파라미터 타입  
// export type MainTabParamList = {
//   Home: undefined;
//   Dashboard: undefined;
//   Challenge: undefined;
//   Profile: undefined;
// };

// // 전체 네비게이션 파라미터 타입
// export type RootStackParamList = {
//   Auth: undefined;
//   Main: undefined;
// };