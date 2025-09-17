import { 
  LoginForm, 
  SignupForm, 
  AuthResponse, 
  User,
  ApiError 
} from '../types/auth';

// 목업 데이터베이스 시뮬레이션
const mockUsers: User[] = [
  {
    id: '1',
    email: 'test@test.com',
    nickname: 'coco',
    phoneNumber: '01012345678',
  }
];

const mockPasswords = new Map([
  ['test@test.com', '1234']
]);

// 네트워크 지연 시뮬레이션
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 목업 로그인 API
export const mockLoginAPI = async (loginData: LoginForm): Promise<AuthResponse> => {
  await delay(1000); // 1초 지연
  
  const { email, password } = loginData;
  
  // 사용자 찾기
  const user = mockUsers.find(u => u.email === email);
  if (!user) {
    throw new Error('존재하지 않는 이메일입니다.');
  }
  
  // 비밀번호 확인
  const storedPassword = mockPasswords.get(email);
  if (storedPassword !== password) {
    throw new Error('비밀번호가 올바르지 않습니다.');
  }
  
  // 성공 응답
  return {
    user,
    token: `mock_jwt_${Date.now()}_${user.id}`
  };
};

// 목업 회원가입 API
export const mockSignupAPI = async (signupData: SignupForm): Promise<AuthResponse> => {
  await delay(1500); // 1.5초 지연
  
  const { email, nickname, phoneNumber, password } = signupData;
  
  // 이메일 중복 확인
  const existingUser = mockUsers.find(u => u.email === email);
  if (existingUser) {
    throw new Error('이미 가입된 이메일입니다.');
  }
  
  // 닉네임 중복 확인
  const existingNickname = mockUsers.find(u => u.nickname === nickname);
  if (existingNickname) {
    throw new Error('이미 사용중인 닉네임입니다.');
  }
  
  // 새 사용자 생성
  const newUser: User = {
    id: Date.now().toString(),
    email,
    nickname,
    phoneNumber,
  };
  
  // 목업 데이터베이스에 추가
  mockUsers.push(newUser);
  mockPasswords.set(email, password);
  
  console.log('회원가입 완료 - 목업 사용자 목록:', mockUsers);
  
  // 성공 응답
  return {
    user: newUser,
    token: `mock_jwt_${Date.now()}_${newUser.id}`
  };
};

// 목업 이메일 중복 확인 API
export const mockCheckEmailAPI = async (email: string): Promise<{ available: boolean }> => {
  await delay(500);
  
  const existingUser = mockUsers.find(u => u.email === email);
  return {
    available: !existingUser
  };
};

// 목업 이메일 인증번호 발송 API
export const mockSendVerificationCodeAPI = async (email: string): Promise<{ success: boolean }> => {
  await delay(1000);
  
  // 실제로는 서버에서 이메일 발송
  console.log(`인증번호 발송됨 (목업): ${email} -> 1234`);
  
  return {
    success: true
  };
};

// 목업 인증번호 확인 API
export const mockVerifyCodeAPI = async (email: string, code: string): Promise<{ valid: boolean }> => {
  await delay(500);
  
  // 목업에서는 항상 '1234'가 올바른 인증번호
  const isValid = code === '1234';
  
  return {
    valid: isValid
  };
};

// 목업 닉네임 중복 확인 API
export const mockCheckNicknameAPI = async (nickname: string): Promise<{ available: boolean }> => {
  await delay(500);
  
  const existingUser = mockUsers.find(u => u.nickname === nickname);
  return {
    available: !existingUser
  };
};

// 나중에 실제 API로 교체할 때는 이 파일을 다음과 같이 변경:
/*
export const loginAPI = async (loginData: LoginForm): Promise<AuthResponse> => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(loginData)
  });
  
  if (!response.ok) {
    throw new Error('로그인 실패');
  }
  
  return response.json();
};
*/