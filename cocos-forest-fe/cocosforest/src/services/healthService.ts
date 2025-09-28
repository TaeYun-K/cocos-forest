import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// @ts-ignore
import Pedometer from 'react-native-pedometer';

export interface StepData {
  steps: number;
  date: string;
}

export interface HealthPermission {
  granted: boolean;
  error?: string;
}

class HealthService {
  private isAvailable: boolean = false;

  constructor() {
    this.checkAvailability();
  }

  private async checkAvailability(): Promise<void> {
    try {
      if (Platform.OS === 'ios') {
        const isAvailable = await Pedometer.isStepCountingAvailable();
        this.isAvailable = isAvailable;
      } else {
        // Android에서는 기본적으로 사용 가능
        this.isAvailable = true;
      }
    } catch (error) {
      console.log('Health service not available:', error);
      this.isAvailable = false;
    }
  }

  async requestPermissions(): Promise<HealthPermission> {
    try {
      if (!this.isAvailable) {
        return {
          granted: false,
          error: '건강 데이터 접근이 지원되지 않습니다.',
        };
      }

      // 실제로는 react-native-health를 사용하여 권한 요청
      // 여기서는 시뮬레이션
      return {
        granted: true,
      };
    } catch (error) {
      return {
        granted: false,
        error: '권한 요청 중 오류가 발생했습니다.',
      };
    }
  }

  async getTodaySteps(): Promise<StepData> {
    try {
      if (!this.isAvailable) {
        throw new Error('건강 데이터 접근이 지원되지 않습니다.');
      }

      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

      const result = await Pedometer.queryPedometerDataBetweenDates(
        startOfDay,
        endOfDay
      );

      if (result && result.numberOfSteps !== undefined) {
        return {
          steps: result.numberOfSteps,
          date: today.toISOString().split('T')[0],
        };
      } else {
        const todayKey = today.toISOString().split('T')[0];
        const storageKey = `simulatedSteps_${todayKey}`;
        
        try {
          const storedSteps = await AsyncStorage.getItem(storageKey);
          let currentSteps = storedSteps ? parseInt(storedSteps) : 0;
          currentSteps += 3000;
          await AsyncStorage.setItem(storageKey, currentSteps.toString());
          
          return {
            steps: currentSteps,
            date: today.toISOString().split('T')[0],
          };
        } catch (error) {
          return {
            steps: 5000,
            date: today.toISOString().split('T')[0],
          };
        }
      }
    } catch (error) {
      const today = new Date();
      const todayKey = today.toISOString().split('T')[0];
      const storageKey = `simulatedSteps_${todayKey}`;
      
      try {
        const storedSteps = await AsyncStorage.getItem(storageKey);
        let currentSteps = storedSteps ? parseInt(storedSteps) : 0;
        currentSteps += 3000;
        await AsyncStorage.setItem(storageKey, currentSteps.toString());
        
        return {
          steps: currentSteps,
          date: today.toISOString().split('T')[0],
        };
      } catch (storageError) {
        return {
          steps: 5000,
          date: today.toISOString().split('T')[0],
        };
      }
    }
  }

  async getStepsForDateRange(startDate: Date, endDate: Date): Promise<StepData[]> {
    try {
      if (!this.isAvailable) {
        throw new Error('건강 데이터 접근이 지원되지 않습니다.');
      }

      const result = await Pedometer.queryPedometerDataBetweenDates(startDate, endDate);
      
      if (result && result.numberOfSteps !== undefined) {
        return [{
          steps: result.numberOfSteps,
          date: startDate.toISOString().split('T')[0],
        }];
      } else {
        // 시뮬레이션 데이터
        const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const stepsData: StepData[] = [];
        
        for (let i = 0; i < daysDiff; i++) {
          const date = new Date(startDate);
          date.setDate(date.getDate() + i);
          const simulatedSteps = Math.floor(Math.random() * 8000) + 2000;
          
          stepsData.push({
            steps: simulatedSteps,
            date: date.toISOString().split('T')[0],
          });
        }
        
        return stepsData;
      }
    } catch (error) {
      console.log('Error fetching steps for date range:', error);
      return [];
    }
  }

  isHealthDataAvailable(): boolean {
    return this.isAvailable;
  }

  async checkHealthKitAvailability(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        return await Pedometer.isStepCountingAvailable();
      }
      return true; // Android는 기본적으로 지원
    } catch (error) {
      console.log('HealthKit availability check failed:', error);
      return false;
    }
  }
}

export const healthService = new HealthService();

