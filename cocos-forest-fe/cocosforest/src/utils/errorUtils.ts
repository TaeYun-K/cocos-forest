export const getErrorMessage = (error: any): string => {
  return error.response?.data?.message || error.message || '알 수 없는 오류';
};

export const handleApiError = (error: any, defaultMessage: string): string => {
  const errorMessage = getErrorMessage(error);
  return `${defaultMessage}\n에러: ${errorMessage}`;
};

