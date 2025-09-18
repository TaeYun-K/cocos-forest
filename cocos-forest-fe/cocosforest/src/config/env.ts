// 환경변수 설정 및 타입 정의

export const ENV = {
  // API 설정
  API_BASE_URL: __DEV__
    ? process.env.EXPO_PUBLIC_API_BASE_URL_DEV || 'http://192.168.30.111:8080'
    : process.env.EXPO_PUBLIC_API_BASE_URL_PROD || 'https://j13e205.p.ssafy.io/dev',

  API_TIMEOUT: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '10000', 10),

  // 앱 정보
  APP_NAME: process.env.EXPO_PUBLIC_APP_NAME || 'CocoForest',
  APP_VERSION: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',

  // 토큰 저장 키
  AUTH_TOKEN_KEY: process.env.EXPO_PUBLIC_AUTH_TOKEN_KEY || 'auth_token',
  REFRESH_TOKEN_KEY: process.env.EXPO_PUBLIC_REFRESH_TOKEN_KEY || 'refresh_token',
  AUTH_USER_KEY: process.env.EXPO_PUBLIC_AUTH_USER_KEY || 'auth_user',

  // 로그 레벨
  LOG_LEVEL: process.env.EXPO_PUBLIC_LOG_LEVEL || 'info',

  // 개발 모드 여부
  IS_DEV: __DEV__,
} as const;

// 환경변수 타입 정의
export type EnvConfig = typeof ENV;

// 환경변수 검증 함수
export const validateEnv = (): boolean => {
  const requiredVars = [
    'API_BASE_URL',
  ];

  for (const varName of requiredVars) {
    if (!ENV[varName as keyof typeof ENV]) {
      console.error(`❌ 필수 환경변수 ${varName}이 설정되지 않았습니다.`);
      return false;
    }
  }

  console.log('✅ 환경변수 검증 완료');
  console.log('📊 현재 설정:', {
    API_BASE_URL: ENV.API_BASE_URL,
    IS_DEV: ENV.IS_DEV,
    APP_VERSION: ENV.APP_VERSION,
  });

  return true;
};