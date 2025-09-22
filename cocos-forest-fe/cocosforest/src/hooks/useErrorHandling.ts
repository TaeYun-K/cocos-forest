import { useCallback } from 'react';
import logger from '../utils/logger';

/**
 * React Query 에러 처리를 위한 커스텀 훅
 */
export const useErrorHandling = () => {
  /**
   * 에러를 사용자 친화적인 메시지로 변환
   */
  const getErrorMessage = useCallback((error: any): string => {
    if (!error) return '알 수 없는 오류가 발생했습니다.';

    // 네트워크 에러
    if (!error.response) {
      return '네트워크 연결을 확인해주세요.';
    }

    // HTTP 상태 코드별 처리
    switch (error.response?.status) {
      case 400:
        return '잘못된 요청입니다. 입력값을 확인해주세요.';
      case 401:
        return '로그인이 필요합니다.';
      case 403:
        return '접근 권한이 없습니다.';
      case 404:
        return '요청한 데이터를 찾을 수 없습니다.';
      case 429:
        return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
      case 500:
        return '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
      case 503:
        return '서비스가 일시적으로 사용할 수 없습니다.';
      default:
        return error.message || '오류가 발생했습니다.';
    }
  }, []);

  /**
   * 에러 로깅 및 사용자 알림
   */
  const handleError = useCallback((error: any, context: string) => {
    const userMessage = getErrorMessage(error);

    // 에러 로깅
    logger.error(`${context} 에러`, {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      userMessage,
    });

    return userMessage;
  }, [getErrorMessage]);

  /**
   * React Query용 onError 핸들러
   */
  const createQueryErrorHandler = useCallback((context: string) => {
    return (error: any) => {
      handleError(error, context);
    };
  }, [handleError]);

  /**
   * 재시도 가능한 에러인지 판단
   */
  const shouldRetry = useCallback((error: any, failureCount: number): boolean => {
    // 최대 재시도 횟수 초과
    if (failureCount >= 3) return false;

    // 네트워크 에러는 재시도
    if (!error.response) return true;

    // 일시적인 서버 에러는 재시도
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    return retryableStatuses.includes(error.response?.status);
  }, []);

  return {
    getErrorMessage,
    handleError,
    createQueryErrorHandler,
    shouldRetry,
  };
};