import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '../config/env';
import {
  User,
  LoginForm,
  SignupForm,
  SignupStep1Form,
  SignupStep2Form,
  SignupStep3Form,
  AuthResponse,
  TokenInfo,
  SignupResponseDto
} from '../types/auth';
import { authService } from '../services/authService';
// Mock API import 제거

interface AuthState {
  // 기본 인증 상태
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitializing: boolean;
  
  // 회원가입 임시 데이터
  signupData: {
    step1?: SignupStep1Form;
    step2?: SignupStep2Form;
    step3?: SignupStep3Form;
  };
  
  // 기본 액션
  login: (loginData: LoginForm) => Promise<void>;
  signup: (signupData: SignupForm) => Promise<void>;
  logout: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
  
  // 회원가입 단계별 액션
  saveSignupStep1: (data: SignupStep1Form) => void;
  saveSignupStep2: (data: SignupStep2Form) => void;
  saveSignupStep3: (data: SignupStep3Form) => void;
  clearSignupData: () => void;
  
  // 유틸리티 액션
  checkEmailAvailability: (email: string) => Promise<boolean>;
  sendVerificationCode: (email: string) => Promise<void>;
  verifyCode: (email: string, code: string) => Promise<boolean>;
  checkNicknameAvailability: (nickname: string) => Promise<boolean>;
}

// 환경변수에서 키 값 가져오기
const AUTH_TOKEN_KEY = ENV.AUTH_TOKEN_KEY;
const AUTH_USER_KEY = ENV.AUTH_USER_KEY;

export const useAuthStore = create<AuthState>((set, get) => ({
  // 초기 상태
  isAuthenticated: false,
  user: null,
  token: null,
  isLoading: false,
  isInitializing: false,
  signupData: {},

  // 로그인
  login: async (loginData: LoginForm) => {
    try {
      set({ isLoading: true });

      const tokenInfo: TokenInfo = await authService.login(loginData);

      await AsyncStorage.setItem(AUTH_TOKEN_KEY, tokenInfo.accessToken);
      await AsyncStorage.setItem(ENV.REFRESH_TOKEN_KEY, tokenInfo.refreshToken);

      await new Promise(resolve => setTimeout(resolve, 2000));

      set({
        isAuthenticated: true,
        user: null,
        token: tokenInfo.accessToken,
        isLoading: false,
      });

      console.log('로그인 성공:', tokenInfo);

    } catch (error) {
      set({ isLoading: false });
      console.error('로그인 실패:', error);
      throw error;
    }
  },

  // 회원가입
  signup: async (signupData: SignupForm) => {
    try {
      set({ isLoading: true });

      // 실제 API 호출
      const signupResponse: SignupResponseDto = await authService.signup(signupData);

      // 회원가입 성공 후 자동 로그인 처리
      const loginData: LoginForm = {
        email: signupData.email,
        password: signupData.password,
      };

      const tokenInfo: TokenInfo = await authService.login(loginData);

      // AsyncStorage에 토큰 저장
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, tokenInfo.accessToken);
      await AsyncStorage.setItem(ENV.REFRESH_TOKEN_KEY, tokenInfo.refreshToken);

      // User 타입에 맞게 변환
      const user: User = {
        id: signupResponse.id,
        email: signupResponse.email,
        nickname: signupResponse.nickname,
        phoneNumber: signupResponse.phoneNumber,
      };

      // 상태 업데이트
      set({
        isAuthenticated: true,
        user: user,
        token: tokenInfo.accessToken,
        isLoading: false,
        signupData: {}, // 회원가입 완료 후 임시 데이터 초기화
      });

      console.log('회원가입 성공:', user);

    } catch (error) {
      set({ isLoading: false });
      console.error('회원가입 실패:', error);
      throw error;
    }
  },

  // 로그아웃
  logout: async () => {
    try {
      // 저장된 refresh token으로 백엔드 로그아웃 API 호출
      const refreshToken = await AsyncStorage.getItem(ENV.REFRESH_TOKEN_KEY);
      if (refreshToken) {
        try {
          await authService.logout(refreshToken);
        } catch (apiError) {
          console.error('백엔드 로그아웃 API 호출 실패:', apiError);
          // 백엔드 호출이 실패해도 로컬 상태는 초기화
        }
      }

      // AsyncStorage에서 제거
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      await AsyncStorage.removeItem(AUTH_USER_KEY);
      await AsyncStorage.removeItem(ENV.REFRESH_TOKEN_KEY);

      // 상태 초기화
      set({
        isAuthenticated: false,
        user: null,
        token: null,
        signupData: {}, // 회원가입 데이터도 초기화
      });

      console.log('로그아웃 완료');

    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  },

  // 로딩 상태 설정 (기존 코드 유지)
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  // 앱 시작 시 저장된 인증 정보 복원 (기존 코드 유지)
  initialize: async () => {
    try {
      set({ isInitializing: true });

      // 임시: 개발 중에는 항상 로그아웃 상태로 시작
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      await AsyncStorage.removeItem(AUTH_USER_KEY);

      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      const userString = await AsyncStorage.getItem(AUTH_USER_KEY);

      if (token && userString) {
        const user = JSON.parse(userString);
        set({
          isAuthenticated: true,
          user,
          token,
        });
      }
    } catch (error) {
      console.error('인증 정보 복원 실패:', error);
      // 에러 발생 시 저장된 정보 삭제
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      await AsyncStorage.removeItem(AUTH_USER_KEY);
    } finally {
      set({ isInitializing: false });
    }
  },

  // 회원가입 Step 1 데이터 저장
  saveSignupStep1: (data: SignupStep1Form) => {
    set(state => ({
      signupData: {
        ...state.signupData,
        step1: data
      }
    }));
    console.log('Step 1 데이터 저장:', data);
  },

  // 회원가입 Step 2 데이터 저장
  saveSignupStep2: (data: SignupStep2Form) => {
    set(state => ({
      signupData: {
        ...state.signupData,
        step2: data
      }
    }));
    console.log('Step 2 데이터 저장');
  },

  // 회원가입 Step 3 데이터 저장
  saveSignupStep3: (data: SignupStep3Form) => {
    set(state => ({
      signupData: {
        ...state.signupData,
        step3: data
      }
    }));
    console.log('Step 3 데이터 저장:', data);
  },

  // 회원가입 데이터 초기화
  clearSignupData: () => {
    set({ signupData: {} });
    console.log('회원가입 데이터 초기화');
  },

  // 이메일 중복 확인
  checkEmailAvailability: async (email: string): Promise<boolean> => {
    try {
      const isDuplicate = await authService.checkEmailDuplicate(email);
      return !isDuplicate; // 중복이 아니면 available=true
    } catch (error) {
      console.error('이메일 중복 확인 실패:', error);
      throw error;
    }
  },

  // 이메일 인증번호 발송
  sendVerificationCode: async (email: string): Promise<void> => {
    try {
      await authService.sendVerificationCode(email);
      console.log('인증번호 발송 완료:', email);
    } catch (error) {
      console.error('인증번호 발송 실패:', error);
      throw error;
    }
  },

  // 인증번호 확인
  verifyCode: async (email: string, code: string): Promise<boolean> => {
    try {
      return await authService.verifyCode(email, code);
    } catch (error) {
      console.error('인증번호 확인 실패:', error);
      throw error;
    }
  },

  // 닉네임 중복 확인
  checkNicknameAvailability: async (nickname: string): Promise<boolean> => {
    try {
      const isDuplicate = await authService.checkNicknameDuplicate(nickname);
      return !isDuplicate; // 중복이 아니면 available=true
    } catch (error) {
      console.error('닉네임 중복 확인 실패:', error);
      throw error;
    }
  },
}));