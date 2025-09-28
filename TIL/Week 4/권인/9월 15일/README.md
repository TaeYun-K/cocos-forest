# TIL - 2025년 9월 15일

## React Native에서 axios-mock-adapter 사용 방법

### 설치 및 기본 설정

```bash
npm install axios-mock-adapter --save-dev
npm install axios
```

```typescript
// src/api/axios.ts
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: __DEV__ ? 'https://api.cocos-forest.dev' : 'https://api.cocos-forest.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock adapter 선언 (개발 환경에서만 초기화)
let mock: MockAdapter | undefined;

// 개발 환경에서만 mock adapter 설정
if (__DEV__) {
  mock = new MockAdapter(apiClient);

});

// src/api/mockSetup.ts
import MockAdapter from 'axios-mock-adapter';
import { apiClient } from './axiosConfig';

const mock = new MockAdapter(apiClient);

mock.onGet('/users').reply(200, [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
]);

export { mock };
```
```typescript
// src/mocks/setupMocks.ts
import { mock } from '../api/axios';
import { dailyEmissionsData, generateMonthlyReportData, generateDayData } from './mockData';

// axios-mock-adapter가 있을 때만 설정
if (mock) {
  // 일일 탄소 배출량 조회
  mock.onGet(/\/api\/dashboard\/daily-emissions\/(\d+)\/(\d+)/).reply((config) => {
    const matches = config.url?.match(/\/api\/dashboard\/daily-emissions\/(\d+)\/(\d+)/);
    if (!matches) {
      return [400, { error: 'Invalid URL format' }];
    }

    const year = matches[1];
    const month = matches[2];
    const yearMonth = `${year}-${String(month).padStart(2, '0')}`;
    // 기존 데이터가 있으면 사용, 없으면 해당 월의 일수만큼 랜덤 데이터 생성
    let emissions = dailyEmissionsData[yearMonth];
    
    if (!emissions) {
      emissions = {};
      const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        emissions[day] = Math.floor(Math.random() * 26) + 25; // 25-50 사이 랜덤값
      }
    } else {
    }
    return [200, {
      yearMonth,
      emissions
    }];
  });

  // 월별 리포트 조회
  mock.onGet(/\/api\/dashboard\/monthly-report\/(\d+)\/(\d+)/).reply((config) => {
    const matches = config.url?.match(/\/api\/dashboard\/monthly-report\/(\d+)\/(\d+)/);
    if (!matches) {
      return [400, { error: 'Invalid URL format' }];
    }

    const year = parseInt(matches[1]);
    const month = parseInt(matches[2]);    
    const reportData = generateMonthlyReportData(year, month);
    return [200, reportData];
  });

  // 특정 날짜 상세 데이터 조회
  mock.onGet(/\/api\/dashboard\/day-details\/(\d+)\/(\d+)\/(\d+)/).reply((config) => {
    const matches = config.url?.match(/\/api\/dashboard\/day-details\/(\d+)\/(\d+)\/(\d+)/);
    if (!matches) {
      return [400, { error: 'Invalid URL format' }];
    }

    const year = parseInt(matches[1]);
    const month = parseInt(matches[2]);
    const day = parseInt(matches[3]);
  
    try {
      const dayData = generateDayData(year, month, day);    
      return [200, dayData];
    } catch (error) {
      return [500, { error: 'Failed to generate day data' }];
    }
  });

}

export default mock;
```



## 느낀점

React Native에서 axios-mock-adapter를 사용하면서 내부의 목업데이터 로직을 구현하지 않고, 실제로 api 요청을 보내는 형식을 사용하기 때문에 api 연동 시 로직 수정 없이 빠르게 작업할 수 있다는 장점이 있었다.