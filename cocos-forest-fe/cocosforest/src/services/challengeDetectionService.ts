import { fetchTodayData } from '../api/dashboard';
import type { Transaction } from '../types/dashboard';

export interface ChallengeDetectionResult {
  transportUsed: boolean;
  cafeUsed: boolean;
  transportTransactions: Transaction[];
  cafeTransactions: Transaction[];
}

class ChallengeDetectionService {
  private transportKeywords = [
    '버스', '지하철', '택시', '우버', '카카오택시', '티머니', '교통카드', 
    '대중교통', '지하철역', '버스정류장', '교통', 'metro', 'subway', 'bus', 'transport',
    '교통비', '대중교통비', '지하철요금', '버스요금', '교통카드충전'
  ];

  private cafeKeywords = [
    '카페', '커피', '스타벅스', '이디야', '투썸', '커피빈', '빽다방', 
    'cafe', 'coffee', 'starbucks', 'ediya', 'twosome', 'coffeebean',
    '커피숍', '카페라떼', '아메리카노', '에스프레소', '라떼', '모카'
  ];

  async detectTodayChallenges(): Promise<ChallengeDetectionResult> {
    try {
      console.log('🔍 오늘의 챌린지 조건 감지 시작');
      
      const todayData = await fetchTodayData();
      const allTransactions = todayData.result?.transactions || [];

      console.log(`📊 총 ${allTransactions.length}건의 거래 내역 분석`);

      const transportResult = this.detectTransportUsage(allTransactions);
      const cafeResult = this.detectCafeUsage(allTransactions);

      const result = {
        transportUsed: transportResult.length > 0,
        cafeUsed: cafeResult.length > 0,
        transportTransactions: transportResult,
        cafeTransactions: cafeResult
      };

      console.log('✅ 챌린지 감지 완료:', {
        대중교통이용: result.transportUsed,
        카페이용: result.cafeUsed,
        대중교통거래수: result.transportTransactions.length,
        카페거래수: result.cafeTransactions.length
      });

      return result;
    } catch (error) {
      console.error('❌ 챌린지 감지 중 오류:', error);
      
      return {
        transportUsed: false,
        cafeUsed: false,
        transportTransactions: [],
        cafeTransactions: []
      };
    }
  }

  private detectTransportUsage(transactions: Transaction[]): Transaction[] {
    const transportTransactions = transactions.filter(transaction => {
      const merchantName = transaction.merchantName?.toLowerCase() || '';
      const categoryName = transaction.categoryName?.toLowerCase() || '';
      
      return this.transportKeywords.some(keyword => 
        merchantName.includes(keyword.toLowerCase()) || 
        categoryName.includes(keyword.toLowerCase())
      );
    });

    if (transportTransactions.length > 0) {
      console.log('🚌 대중교통 이용 감지:', transportTransactions.map(t => ({
        가맹점: t.merchantName,
        카테고리: t.categoryName,
        금액: t.amountKrw
      })));
    }

    return transportTransactions;
  }

  private detectCafeUsage(transactions: Transaction[]): Transaction[] {
    const cafeTransactions = transactions.filter(transaction => {
      const merchantName = transaction.merchantName?.toLowerCase() || '';
      const categoryName = transaction.categoryName?.toLowerCase() || '';
      
      return this.cafeKeywords.some(keyword => 
        merchantName.includes(keyword.toLowerCase()) || 
        categoryName.includes(keyword.toLowerCase())
      );
    });

    if (cafeTransactions.length > 0) {
      console.log('☕ 카페 이용 감지:', cafeTransactions.map(t => ({
        가맹점: t.merchantName,
        카테고리: t.categoryName,
        금액: t.amountKrw
      })));
    }

    return cafeTransactions;
  }

  isTransportTransaction(transaction: Transaction): boolean {
    const merchantName = transaction.merchantName?.toLowerCase() || '';
    const categoryName = transaction.categoryName?.toLowerCase() || '';
    
    return this.transportKeywords.some(keyword => 
      merchantName.includes(keyword.toLowerCase()) || 
      categoryName.includes(keyword.toLowerCase())
    );
  }

  isCafeTransaction(transaction: Transaction): boolean {
    const merchantName = transaction.merchantName?.toLowerCase() || '';
    const categoryName = transaction.categoryName?.toLowerCase() || '';
    
    return this.cafeKeywords.some(keyword => 
      merchantName.includes(keyword.toLowerCase()) || 
      categoryName.includes(keyword.toLowerCase())
    );
  }

  analyzeTransactionForChallenges(transaction: Transaction) {
    const isTransport = this.isTransportTransaction(transaction);
    const isCafe = this.isCafeTransaction(transaction);
    
    return {
      isTransport,
      isCafe,
      merchantName: transaction.merchantName,
      categoryName: transaction.categoryName,
      amount: transaction.amountKrw,
      date: transaction.txDate
    };
  }
}

export const challengeDetectionService = new ChallengeDetectionService();