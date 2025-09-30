import {
  LoginForm,
  SignupForm,
  User,
  AuthResponse,
  TokenInfo,
  BaseResponse,
  SignupRequestDto,
  SignupResponseDto,
  EmailSendRequest,
  NicknameCheckRequest,
  EmailVerifyRequest,
  LogoutRequest,
  ReissueRequest,
} from "../types/auth";
import apiClient from "../api/axios";
// apk 빌드 로그 테스트

export const authService = {
  // 로그인
  login: async (loginData: LoginForm): Promise<TokenInfo> => {
    try {
      const response = await apiClient.post<BaseResponse<TokenInfo>>(
        "/api/user/login",
        {
          email: loginData.email,
          password: loginData.password,
        }
      );

      if (!response.data.isSuccess) {
        throw new Error(response.data.message || "로그인에 실패했습니다.");
      }

      return response.data.result;
    } catch (error: any) {
      console.error("로그인 오류:", error);

      // 비밀번호 오류 처리 (400 상태코드)
      if (error.response?.status === 400) {
        throw new Error("비밀번호를 잘못 입력하셨습니다.");
      }

      // 기타 오류는 그대로 전달
      throw error;
    }
  },

  // 회원가입
  signup: async (signupData: SignupForm): Promise<SignupResponseDto> => {
    try {
      const requestData: SignupRequestDto = {
        email: signupData.email,
        password: signupData.password,
        nickname: signupData.nickname,
        phoneNumber: signupData.phoneNumber,
        termsAgreed: signupData.agreements.terms,
        privacyPolicyAgreed: signupData.agreements.privacy,
        marketingAgreed: signupData.agreements.marketing,
      };

      const response = await apiClient.post<BaseResponse<SignupResponseDto>>(
        "/api/user/signup",
        requestData
      );

      if (!response.data.isSuccess) {
        throw new Error(response.data.message || "회원가입에 실패했습니다.");
      }

      return response.data.result;
    } catch (error) {
      console.error("회원가입 오류:", error);
      throw error;
    }
  },

  // 이메일 중복 체크
  checkEmailDuplicate: async (email: string): Promise<boolean> => {
    try {
      const requestData: EmailSendRequest = { email };
      const response = await apiClient.post<BaseResponse<void>>(
        "/api/email/check-email-duplicate",
        requestData
      );

      // 성공 응답이면 중복이 아님 (false 반환)
      return false;
    } catch (error: any) {
      console.error("이메일 중복 확인 오류:", error);

      // 409 상태코드면 이메일 중복
      if (error.response?.status === 409) {
        return true;
      }

      // 기타 네트워크 오류 등은 다시 던지기
      throw error;
    }
  },

  // 닉네임 중복 체크
  checkNicknameDuplicate: async (nickname: string): Promise<boolean> => {
    try {
      const requestData: NicknameCheckRequest = { nickname };
      const response = await apiClient.post<BaseResponse<void>>(
        "/api/user/check-nickname-duplicate",
        requestData
      );

      // 성공 응답이면 중복이 아님 (false 반환)
      return false;
    } catch (error: any) {
      console.error("닉네임 중복 확인 오류:", error);

      // 409 상태코드면 닉네임 중복
      if (error.response?.status === 409) {
        return true;
      }

      // 기타 네트워크 오류 등은 다시 던지기
      throw error;
    }
  },

  // 인증번호 발송
  sendVerificationCode: async (email: string): Promise<void> => {
    try {
      const requestData: EmailSendRequest = { email };
      const response = await apiClient.post<BaseResponse<void>>(
        "/api/email/send-verification",
        requestData
      );

      if (!response.data.isSuccess) {
        throw new Error(
          response.data.message || "인증번호 발송에 실패했습니다."
        );
      }
    } catch (error) {
      console.error("인증번호 발송 오류:", error);
      throw error;
    }
  },

  // 인증번호 확인
  verifyCode: async (email: string, code: string): Promise<boolean> => {
    try {
      const requestData: EmailVerifyRequest = { email, code };
      const response = await apiClient.post<BaseResponse<void>>(
        "/api/email/verify-code",
        requestData
      );

      return response.data.isSuccess;
    } catch (error) {
      console.error("인증번호 검증 오류:", error);
      throw error;
    }
  },

  // 로그아웃 (토큰 무효화 등)
  logout: async (refreshToken: string): Promise<void> => {
    try {
      const requestData: LogoutRequest = { refreshToken };
      const response = await apiClient.post<BaseResponse<void>>(
        "/api/user/logout",
        requestData
      );

      if (!response.data.isSuccess) {
        throw new Error(response.data.message || "로그아웃에 실패했습니다.");
      }
    } catch (error) {
      console.error("로그아웃 오류:", error);
      throw error;
    }
  },

  // 토큰 재발급
  reissue: async (refreshToken: string): Promise<TokenInfo> => {
    try {
      const requestData: ReissueRequest = { refreshToken };
      const response = await apiClient.post<BaseResponse<TokenInfo>>(
        "/api/user/reissue",
        requestData
      );

      if (!response.data.isSuccess) {
        throw new Error(response.data.message || "토큰 재발급에 실패했습니다.");
      }

      return response.data.result;
    } catch (error) {
      console.error("토큰 재발급 오류:", error);
      throw error;
    }
  },
};
