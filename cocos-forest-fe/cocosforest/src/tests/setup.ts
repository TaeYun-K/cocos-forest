// React Native Testing Library setup
// Jest matchers are now built-in to @testing-library/react-native

// React Query 테스트를 위한 설정
import { QueryClient } from '@tanstack/react-query';

// 전역 QueryClient 설정
export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
      },
    },
  });

// AsyncStorage mock
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// React Navigation mock
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));

// Image preloader mock
jest.mock('../utils/imagePreloader', () => ({
  imagePreloader: {
    preloadImage: jest.fn().mockResolvedValue(undefined),
    preloadImages: jest.fn().mockResolvedValue(undefined),
    preloadCocoGifs: jest.fn().mockResolvedValue(undefined),
    isPreloaded: jest.fn().mockReturnValue(true),
    clearCache: jest.fn(),
  },
  useImagePreloader: () => ({
    preloadCocoGifs: jest.fn().mockResolvedValue(undefined),
    preloadImage: jest.fn().mockResolvedValue(undefined),
    preloadImages: jest.fn().mockResolvedValue(undefined),
    isPreloaded: jest.fn().mockReturnValue(true),
  }),
}));

// Console 경고 숨기기 (테스트 중 불필요한 로그 제거)
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};