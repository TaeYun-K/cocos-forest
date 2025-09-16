// src/services/authService.ts

import { LoginForm, SignupForm, User, AuthResponse } from '../types/auth';

// 로딩 시뮬레이션을 위한 delay 함수
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 임시 사용자 데이터 (실제로는 백엔드에서 관리)
const mockUsers: User[] = [
  {
    id: '1',
    email: 'test@test.com',
    nickname: 'coco',
    phoneNumber: '01012345678'
  }
];

let mockUserId = mockUsers.length + 1;

export const authService = {
  // 로그인
  login: async (loginData: LoginForm): Promise<AuthResponse> => {
    await delay(1000); // 1초 로딩 시뮬레이션

    // 이메일로 사용자 찾기
    const user = mockUsers.find(u => u.email === loginData.email);
    
    if (!user) {
      throw new Error('존재하지 않는 이메일입니다.');
    }

    // 간단한 비밀번호 검증 (실제로는 해시된 비밀번호 비교)
    if (loginData.password !== '1234') {
      throw new Error('비밀번호가 일치하지 않습니다.');
    }

    // AuthResponse 타입에 맞게 반환
    const response: AuthResponse = {
      user,
      token: `mock_token_${user.id}_${Date.now()}`
    };

    return response;
  },

  // 회원가입
  signup: async (signupData: SignupForm): Promise<AuthResponse> => {
    await delay(1500); // 1.5초 로딩 시뮬레이션

    // 이메일 중복 체크
    const existingUser = mockUsers.find(u => u.email === signupData.email);
    if (existingUser) {
      throw new Error('이미 사용 중인 이메일입니다.');
    }

    // 닉네임 중복 체크
    const existingNickname = mockUsers.find(u => u.nickname === signupData.nickname);
    if (existingNickname) {
      throw new Error('이미 사용 중인 닉네임입니다.');
    }

    // 비밀번호 확인
    if (signupData.password !== signupData.passwordConfirm) {
      throw new Error('비밀번호가 일치하지 않습니다.');
    }

    // 새 사용자 생성
    const newUser: User = {
      id: mockUserId.toString(),
      email: signupData.email,
      nickname: signupData.nickname,
      phoneNumber: signupData.phoneNumber
    };

    mockUsers.push(newUser);
    mockUserId++;

    // AuthResponse 타입에 맞게 반환
    const response: AuthResponse = {
      user: newUser,
      token: `mock_token_${newUser.id}_${Date.now()}`
    };

    return response;
  },

  // 이메일 중복 체크
  checkEmailDuplicate: async (email: string): Promise<boolean> => {
    await delay(500);
    return mockUsers.some(u => u.email === email);
  },

  // 닉네임 중복 체크
  checkNicknameDuplicate: async (nickname: string): Promise<boolean> => {
    await delay(500);
    return mockUsers.some(u => u.nickname === nickname);
  },

  // 인증번호 발송 (목업)
  sendVerificationCode: async (email: string): Promise<{ code: string }> => {
    await delay(1000);
    const mockCode = '1234'; // 실제로는 랜덤 코드 생성
    console.log(`인증번호 발송: ${email} -> ${mockCode}`);
    return { code: mockCode };
  },

  // 인증번호 확인
  verifyCode: async (email: string, code: string): Promise<boolean> => {
    await delay(500);
    // 목업에서는 '1234'만 유효한 코드로 처리
    return code === '1234';
  },

  // 로그아웃 (토큰 무효화 등)
  logout: async (): Promise<void> => {
    await delay(300);
    // 실제로는 서버에서 토큰 무효화
    console.log('로그아웃 완료');
  }
};