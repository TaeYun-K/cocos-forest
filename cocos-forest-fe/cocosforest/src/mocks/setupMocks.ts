// src/mocks/setupMocks.ts - 완전 비활성화
// import { mock } from '../api/axios';
// import { generateMonthlyReportData, generateDayData } from './mockData';

// 고정 cardId
const CARD_ID = "1003-a139e9f23f1a4cc";

// Mock 완전 비활성화 - 실제 백엔드 API만 사용
if (false) {
  console.log('🔧 Setting up axios-mock-adapter...');

  // Daily API: /api/cards/{cardId}/transactions/day
  mock.onGet(new RegExp(`/api/cards/${CARD_ID}/transactions/day`)).reply((config) => {
    const params = config.params || {};
    const { date, force = false } = params;

    console.log(`🎯 Mock Handler Hit: Daily API for date ${date}, force: ${force}`);

    if (!date) {
      return [400, { error: 'date parameter is required' }];
    }

    try {
      // date를 파싱 (YYYY-MM-DD)
      const [year, month, day] = date.split('-').map(Number);
      const dayData = generateDayData(year, month, day);

      console.log('✅ Daily data generated successfully');
      console.log('📦 Returning data:', JSON.stringify(dayData, null, 2));

      return [200, dayData];
    } catch (error) {
      console.error('❌ Error generating daily data:', error);
      return [500, { error: 'Failed to generate daily data' }];
    }
  });

  // Monthly API: /api/cards/{cardId}/transactions/month-summary
  mock.onGet(new RegExp(`/api/cards/${CARD_ID}/transactions/month-summary`)).reply((config) => {
    const params = config.params || {};
    const { yearMonth } = params;

    console.log(`🎯 Mock Handler Hit: Monthly API for yearMonth ${yearMonth}`);

    if (!yearMonth) {
      return [400, { error: 'yearMonth parameter is required' }];
    }

    try {
      // yearMonth를 파싱 (YYYY-MM)
      const [year, month] = yearMonth.split('-').map(Number);
      const monthlyData = generateMonthlyReportData(year, month);

      console.log('✅ Monthly data generated successfully');
      console.log('📦 Returning data:', JSON.stringify(monthlyData, null, 2));

      return [200, monthlyData];
    } catch (error) {
      console.error('❌ Error generating monthly data:', error);
      return [500, { error: 'Failed to generate monthly data' }];
    }
  });

  // 기존 호환성을 위한 레거시 엔드포인트들 (필요시 제거 가능)
  mock.onGet(/\/api\/dashboard\/daily-emissions\/(\d+)\/(\d+)/).reply((config) => {
    const matches = config.url?.match(/\/api\/dashboard\/daily-emissions\/(\d+)\/(\d+)/);
    if (!matches) return [400, { error: 'Invalid URL format' }];

    const year = parseInt(matches[1]);
    const month = parseInt(matches[2]);
    const yearMonth = `${year}-${String(month).padStart(2, '0')}`;

    console.log(`🎯 Legacy Handler: daily-emissions for ${yearMonth}`);

    const monthlyData = generateMonthlyReportData(year, month);
    const emissions: { [key: number]: number } = {};

    monthlyData.daily.forEach(dayData => {
      const day = parseInt(dayData.date.split('-')[2]);
      emissions[day] = dayData.carbonTotalKg;
    });

    return [200, { emissions }];
  });

  mock.onGet(/\/api\/dashboard\/monthly-report\/(\d+)\/(\d+)/).reply((config) => {
    const matches = config.url?.match(/\/api\/dashboard\/monthly-report\/(\d+)\/(\d+)/);
    if (!matches) return [400, { error: 'Invalid URL format' }];

    const year = parseInt(matches[1]);
    const month = parseInt(matches[2]);

    console.log(`🎯 Legacy Handler: monthly-report for ${year}-${month}`);

    return [200, generateMonthlyReportData(year, month)];
  });

  // Finance API Mock 설정
  
  // 은행 목록 조회 API
  mock.onGet('/api/finance/banks').reply(200, {
    httpStatus: 'OK',
    isSuccess: true,
    message: 'Success',
    code: 'SUCCESS',
    result: [
      { bankCode: '004', bankName: '국민은행' },
      { bankCode: '088', bankName: '신한은행' },
      { bankCode: '081', bankName: 'KEB하나은행' },
      { bankCode: '020', bankName: '우리은행' },
      { bankCode: '090', bankName: '카카오뱅크' },
      { bankCode: '999', bankName: '싸피은행' },
      { bankCode: '011', bankName: '농협은행' },
      { bankCode: '023', bankName: 'SC제일은행' },
      { bankCode: '027', bankName: '시티은행' },
      { bankCode: '032', bankName: '대구은행' },
      { bankCode: '034', bankName: '광주은행' },
      { bankCode: '035', bankName: '제주은행' },
      { bankCode: '037', bankName: '전북은행' },
      { bankCode: '039', bankName: '경남은행' }
    ]
  });

  // 카드 상품 목록 조회 API (실제 데이터 기반)
  mock.onGet('/api/finance/card-products').reply(200, {
    httpStatus: 'OK',
    isSuccess: true,
    message: 'Success',
    code: 'SUCCESS',
    result: [
      {
        productId: 1,
        issuerCode: '1001',
        cardUniqueNo: '1001-c3640f796f6f4ec',
        name: '코코 에코 라이프',
        description: '생활 20% 할인, 교통 10% 할인, 대형마트 5% 할인',
        baselinePerformance: 600000,
        maxBenefitLimit: 120000
      },
      {
        productId: 2,
        issuerCode: '1001',
        cardUniqueNo: '1001-98b9cf4ea92440d',
        name: '코코 에코 교통',
        description: '교통 15% 할인, 생활 5% 할인',
        baselinePerformance: 500000,
        maxBenefitLimit: 100000
      },
      {
        productId: 3,
        issuerCode: '1001',
        cardUniqueNo: '1001-2bae01ac6e06459',
        name: '코코 에코 리빙',
        description: '생활 10% 할인, 대형마트 10% 할인',
        baselinePerformance: 400000,
        maxBenefitLimit: 90000
      }
    ]
  });

  // 사용자 계좌 목록 조회 API
  mock.onGet(/\/api\/finance\/accounts\/user\/(\d+)/).reply(200, {
    httpStatus: 'OK',
    isSuccess: true,
    message: 'Success',
    code: 'SUCCESS',
    result: [
      {
        accountId: 1,
        userId: 1,
        accountNo: '123-456-789012',
        bankCode: '999',
        accountTypeUniqueNo: 'SF-DEPOSIT-001',
        currency: 'KRW',
        currencyName: '원',
        status: 'ACTIVE',
        createdAt: '2025-01-15T09:30:00+09:00'
      },
      {
        accountId: 2,
        userId: 1,
        accountNo: '987-654-321098',
        bankCode: '088',
        accountTypeUniqueNo: 'SH-SAVING-001',
        currency: 'KRW',
        currencyName: '원',
        status: 'ACTIVE',
        createdAt: '2025-02-20T14:15:00+09:00'
      }
    ]
  });

  // 은행별 계좌 상품 목록 조회 API
  mock.onGet(/\/api\/finance\/account-products\/banks\/(.+)/).reply((config) => {
    const matches = config.url?.match(/\/api\/finance\/account-products\/banks\/(.+)/);
    const bankCode = matches?.[1];
    
    // 은행별 계좌 상품 데이터
    const accountProducts: { [key: string]: any[] } = {
      '004': [
        {
          productId: 1,
          accountTypeUniqueNo: 'KB-DEPOSIT-001',
          bankCode: '004',
          bankName: '국민은행',
          accountTypeCode: 'DEPOSIT',
          accountTypeName: '입출금통장',
          accountName: '국민 자유입출금통장',
          accountDescription: '언제든 자유롭게 입출금 가능한 통장',
          accountType: 'DOMESTIC',
          createdAt: '2025-01-01T00:00:00+09:00'
        },
        {
          productId: 2,
          accountTypeUniqueNo: 'KB-SAVING-001',
          bankCode: '004',
          bankName: '국민은행',
          accountTypeCode: 'SAVING',
          accountTypeName: '적금',
          accountName: '국민 정기적금',
          accountDescription: '매월 일정금액 적립하는 적금상품',
          accountType: 'DOMESTIC',
          createdAt: '2025-01-01T00:00:00+09:00'
        }
      ],
      '088': [
        {
          productId: 3,
          accountTypeUniqueNo: 'SH-DEPOSIT-001',
          bankCode: '088',
          bankName: '신한은행',
          accountTypeCode: 'DEPOSIT',
          accountTypeName: '입출금통장',
          accountName: '신한 쏠편한 입출금통장',
          accountDescription: '모바일 특화 입출금 통장',
          accountType: 'DOMESTIC',
          createdAt: '2025-01-01T00:00:00+09:00'
        }
      ],
      '999': [
        {
          productId: 4,
          accountTypeUniqueNo: 'SF-DEPOSIT-001',
          bankCode: '999',
          bankName: '싸피은행',
          accountTypeCode: 'DEPOSIT',
          accountTypeName: '입출금통장',
          accountName: '싸피 개발자 통장',
          accountDescription: '개발자를 위한 특별한 입출금 통장',
          accountType: 'DOMESTIC',
          createdAt: '2025-01-01T00:00:00+09:00'
        },
        {
          productId: 5,
          accountTypeUniqueNo: 'SF-SAVING-001',
          bankCode: '999',
          bankName: '싸피은행',
          accountTypeCode: 'SAVING',
          accountTypeName: '적금',
          accountName: '싸피 코딩 적금',
          accountDescription: '코딩하며 모으는 적금',
          accountType: 'DOMESTIC',
          createdAt: '2025-01-01T00:00:00+09:00'
        }
      ]
    };

    const products = accountProducts[bankCode || ''] || [
      {
        productId: 99,
        accountTypeUniqueNo: `${bankCode}-DEPOSIT-001`,
        bankCode: bankCode,
        bankName: `은행코드 ${bankCode}`,
        accountTypeCode: 'DEPOSIT',
        accountTypeName: '입출금통장',
        accountName: '기본 입출금통장',
        accountDescription: '기본 입출금 상품',
        accountType: 'DOMESTIC',
        createdAt: '2025-01-01T00:00:00+09:00'
      }
    ];

    return [200, {
      httpStatus: 'OK',
      isSuccess: true,
      message: 'Success',
      code: 'SUCCESS',
      result: products
    }];
  });

  // 수시입출금 계좌 생성 API
  mock.onPost(/\/api\/finance\/accounts\/demand-deposit/).reply((config) => {
    const data = JSON.parse(config.data || '{}');
    const accountTypeUniqueNo = data.accountTypeUniqueNo;
    
    // 새 계좌번호 생성 (랜덤)
    const accountNo = `${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900000) + 100000}-${Math.floor(Math.random() * 900000) + 100000}`;
    
    return [200, {
      httpStatus: 'OK',
      isSuccess: true,
      message: 'Account created successfully',
      code: 'SUCCESS',
      result: {
        bankCode: accountTypeUniqueNo.split('-')[0] || '999',
        accountNo: accountNo,
        currency: 'KRW',
        currencyName: '원',
        createdAt: new Date().toISOString()
      }
    }];
  });

  console.log('✅ axios-mock-adapter setup complete');
}

// export default mock;