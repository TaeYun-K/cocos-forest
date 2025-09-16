import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  User, 
  LoginForm, 
  SignupForm,
  SignupStep1Form,
  SignupStep2Form,
  SignupStep3Form,
  AuthResponse 
} from '../types/auth';
import { 
  mockLoginAPI, 
  mockSignupAPI,
  mockCheckEmailAPI,
  mockSendVerificationCodeAPI,
  mockVerifyCodeAPI,
  mockCheckNicknameAPI
} from '../api/mockApi';

interface AuthState {
  // 기본 인증 상태
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  
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

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';

export const useAuthStore = create<AuthState>((set, get) => ({
  // 초기 상태
  isAuthenticated: false,
  user: null,
  token: null,
  isLoading: false,
  signupData: {},

  // 로그인 (기존 코드 + API 호출 추가)
  login: async (loginData: LoginForm) => {
    try {
      set({ isLoading: true });
      
      // 목업 API 호출 (나중에 실제 API로 교체)
      const response: AuthResponse = await mockLoginAPI(loginData);
      
      // AsyncStorage에 저장
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, response.token);
      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));
      
      // 상태 업데이트
      set({
        isAuthenticated: true,
        user: response.user,
        token: response.token,
        isLoading: false,
      });
      
      console.log('로그인 성공:', response.user);
      
    } catch (error) {
      set({ isLoading: false });
      console.error('로그인 실패:', error);
      throw error;
    }
  },

  // 회원가입 (새로 추가)
  signup: async (signupData: SignupForm) => {
    try {
      set({ isLoading: true });
      
      // 목업 API 호출 (나중에 실제 API로 교체)
      const response: AuthResponse = await mockSignupAPI(signupData);
      
      // AsyncStorage에 저장
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, response.token);
      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));
      
      // 상태 업데이트
      set({
        isAuthenticated: true,
        user: response.user,
        token: response.token,
        isLoading: false,
        signupData: {}, // 회원가입 완료 후 임시 데이터 초기화
      });
      
      console.log('회원가입 성공:', response.user);
      
    } catch (error) {
      set({ isLoading: false });
      console.error('회원가입 실패:', error);
      throw error;
    }
  },

  // 로그아웃 (기존 코드 유지)
  logout: async () => {
    try {
      // AsyncStorage에서 제거
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      await AsyncStorage.removeItem(AUTH_USER_KEY);
      
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
      set({ isLoading: true });

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
      set({ isLoading: false });
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
      const response = await mockCheckEmailAPI(email);
      return response.available;
    } catch (error) {
      console.error('이메일 중복 확인 실패:', error);
      throw error;
    }
  },

  // 이메일 인증번호 발송
  sendVerificationCode: async (email: string): Promise<void> => {
    try {
      await mockSendVerificationCodeAPI(email);
      console.log('인증번호 발송 완료:', email);
    } catch (error) {
      console.error('인증번호 발송 실패:', error);
      throw error;
    }
  },

  // 인증번호 확인
  verifyCode: async (email: string, code: string): Promise<boolean> => {
    try {
      const response = await mockVerifyCodeAPI(email, code);
      return response.valid;
    } catch (error) {
      console.error('인증번호 확인 실패:', error);
      throw error;
    }
  },

  // 닉네임 중복 확인
  checkNicknameAvailability: async (nickname: string): Promise<boolean> => {
    try {
      const response = await mockCheckNicknameAPI(nickname);
      return response.available;
    } catch (error) {
      console.error('닉네임 중복 확인 실패:', error);
      throw error;
    }
  },
}));