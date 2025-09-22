// 인증 스택 네비게이션 타입
export type AuthStackParamList = {
  Login: undefined;
  SignupStep1: undefined;
  SignupStep2: {
    signupData: any; // 1단계에서 전달받은 데이터
  };
  SignupStep3: {
    signupData: any; // 1,2단계에서 전달받은 데이터
  };
};

// 메인 탭 네비게이션 타입
export type MainTabParamList = {
  Home: undefined;
  Dashboard: undefined;
  Challenge: undefined;
  Profile: undefined;
};

// 루트 스택 네비게이션 타입
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

// import { NavigatorScreenParams } from '@react-navigation/native';

// export type RootStackParamList = {
//   Auth: NavigatorScreenParams<AuthStackParamList>;
//   Main: NavigatorScreenParams<MainTabParamList>;
// };

// export type AuthStackParamList = {
//   Login: undefined;
//   SignupStep1: undefined;
//   SignupStep2: {
//     signupData: {
//       nickname: string;
//       email: string;
//       verificationCode: string;
//       phoneNumber: string;
//     };
//   };
//   SignupStep3: {
//     signupData: {
//       nickname: string;
//       email: string;
//       verificationCode: string;
//       phoneNumber: string;
//       password: string;
//       passwordConfirm: string;
//     };
//   };
// };

// export type MainTabParamList = {
//   Home: undefined;
//   Dashboard: undefined;
//   Challenge: undefined;
//   Profile: undefined;
// };