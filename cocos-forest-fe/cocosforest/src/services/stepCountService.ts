import { Platform, Alert, PermissionsAndroid } from 'react-native';
import HealthKit from 'react-native-health';
import Pedometer from 'react-native-pedometer';

export interface StepCountData {
  steps: number;
  date: string;
  timestamp: number;
}

export interface StepCountResponse {
  success: boolean;
  data?: StepCountData;
  error?: string;
}

class StepCountService {
  private isHealthKitAvailable = false;
  private isPedometerAvailable = false;

  constructor() {
    // 비동기 초기화는 별도로 처리
    this.initializeServices().catch(error => {
      console.error('걸음수 서비스 초기화 실패:', error);
    });
  }

  private async initializeServices() {
    try {
      if (Platform.OS === 'ios') {
        const isAvailable = await HealthKit.isAvailable();
        this.isHealthKitAvailable = isAvailable;
        console.log('HealthKit 사용 가능:', isAvailable);
      } else if (Platform.OS === 'android') {
        // Android에서는 Pedometer가 기본적으로 사용 가능하다고 가정
        // 실제 권한은 사용 시점에 확인
        this.isPedometerAvailable = true;
        console.log('Android Pedometer 사용 가능');
      }
    } catch (error) {
      console.error('걸음수 서비스 초기화 실패:', error);
    }
  }

  /**
   * 권한 요청
   */
  async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios' && this.isHealthKitAvailable) {
        const permissions = {
          permissions: {
            read: [HealthKit.Constants.Permissions.Steps],
            write: [],
          },
        };

        const granted = await HealthKit.initHealthKit(permissions);
        console.log('HealthKit 권한 승인:', granted);
        return granted;
      } else if (Platform.OS === 'android') {
        // Android에서는 Activity Recognition 권한 요청
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION,
          {
            title: '걸음수 측정 권한',
            message: '걸음수를 측정하여 탄소 발자국을 추적하고 포인트를 획득하기 위해 활동 인식 권한이 필요합니다.',
            buttonNeutral: '나중에',
            buttonNegative: '취소',
            buttonPositive: '허용',
          }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          this.isPedometerAvailable = true;
          console.log('Android 걸음수 측정 권한 승인');
          return true;
        } else {
          console.log('Android 걸음수 측정 권한 거부');
          Alert.alert(
            '권한 필요',
            '걸음수 측정을 위해 활동 인식 권한이 필요합니다. 설정에서 권한을 허용해주세요.'
          );
          return false;
        }
      }
      return false;
    } catch (error) {
      console.error('권한 요청 실패:', error);
      Alert.alert('권한 오류', '걸음수 측정을 위한 권한이 필요합니다.');
      return false;
    }
  }

  /**
   * 오늘의 걸음수 가져오기
   */
  async getTodayStepCount(): Promise<StepCountResponse> {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

      if (Platform.OS === 'ios' && this.isHealthKitAvailable) {
        return await this.getStepCountFromHealthKit(startOfDay, endOfDay);
      } else if (Platform.OS === 'android' && this.isPedometerAvailable) {
        return await this.getStepCountFromPedometer(startOfDay, endOfDay);
      } else {
        return {
          success: false,
          error: '걸음수 측정 기능을 사용할 수 없습니다.',
        };
      }
    } catch (error) {
      console.error('걸음수 조회 실패:', error);
      return {
        success: false,
        error: '걸음수 조회 중 오류가 발생했습니다.',
      };
    }
  }

  /**
   * HealthKit에서 걸음수 가져오기 (iOS)
   */
  private async getStepCountFromHealthKit(startDate: Date, endDate: Date): Promise<StepCountResponse> {
    try {
      const options = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        includeManuallyAdded: false,
      };

      const steps = await HealthKit.getStepCount(options);
      console.log('HealthKit 걸음수:', steps);

      return {
        success: true,
        data: {
          steps: steps || 0,
          date: startDate.toISOString().split('T')[0],
          timestamp: Date.now(),
        },
      };
    } catch (error) {
      console.error('HealthKit 걸음수 조회 실패:', error);
      return {
        success: false,
        error: 'HealthKit에서 걸음수를 가져올 수 없습니다.',
      };
    }
  }

  /**
   * Pedometer에서 걸음수 가져오기 (Android)
   */
  private async getStepCountFromPedometer(startDate: Date, endDate: Date): Promise<StepCountResponse> {
    return new Promise(async (resolve) => {
      try {
        // Android 권한 확인
        const hasPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION
        );

        if (!hasPermission) {
          resolve({
            success: false,
            error: '활동 인식 권한이 필요합니다.',
          });
          return;
        }

        const options = {
          startDate: startDate,
          endDate: endDate,
        };

        Pedometer.getStepCount(options, (error, result) => {
          if (error) {
            console.error('Pedometer 걸음수 조회 실패:', error);
            resolve({
              success: false,
              error: 'Pedometer에서 걸음수를 가져올 수 없습니다.',
            });
          } else {
            console.log('Pedometer 걸음수:', result);
            resolve({
              success: true,
              data: {
                steps: result?.numberOfSteps || 0,
                date: startDate.toISOString().split('T')[0],
                timestamp: Date.now(),
              },
            });
          }
        });
      } catch (error) {
        console.error('Pedometer 권한 확인 실패:', error);
        resolve({
          success: false,
          error: '권한 확인 중 오류가 발생했습니다.',
        });
      }
    });
  }

  /**
   * 특정 날짜의 걸음수 가져오기
   */
  async getStepCountForDate(date: Date): Promise<StepCountResponse> {
    try {
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

      if (Platform.OS === 'ios' && this.isHealthKitAvailable) {
        return await this.getStepCountFromHealthKit(startOfDay, endOfDay);
      } else if (Platform.OS === 'android' && this.isPedometerAvailable) {
        return await this.getStepCountFromPedometer(startOfDay, endOfDay);
      } else {
        return {
          success: false,
          error: '걸음수 측정 기능을 사용할 수 없습니다.',
        };
      }
    } catch (error) {
      console.error('특정 날짜 걸음수 조회 실패:', error);
      return {
        success: false,
        error: '걸음수 조회 중 오류가 발생했습니다.',
      };
    }
  }

  /**
   * 걸음수 측정 가능 여부 확인
   */
  isStepCountAvailable(): boolean {
    if (Platform.OS === 'ios') {
      return this.isHealthKitAvailable;
    } else if (Platform.OS === 'android') {
      return this.isPedometerAvailable;
    }
    return false;
  }

  /**
   * 플랫폼별 사용 가능한 서비스 정보
   */
  getServiceInfo() {
    return {
      platform: Platform.OS,
      healthKitAvailable: this.isHealthKitAvailable,
      pedometerAvailable: this.isPedometerAvailable,
      isAvailable: this.isStepCountAvailable(),
    };
  }
}

export default new StepCountService();
