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
      const todayData = await fetchTodayData();
      const allTransactions = todayData.transactions || [];
      
      const transportResult = this.detectTransportUsage(allTransactions);
      const cafeResult = this.detectCafeUsage(allTransactions);


      return {
        transportUsed: transportResult.length > 0,
        cafeUsed: cafeResult.length > 0,
        transportTransactions: transportResult,
        cafeTransactions: cafeResult
      };
    } catch (error) {
      console.error('❌ 챌린지 감지 오류:', error);
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
      
      const isTransport = this.transportKeywords.some(keyword => {
        const keywordLower = keyword.toLowerCase();
        const merchantMatch = merchantName.includes(keywordLower);
        const categoryMatch = categoryName.includes(keywordLower);
        
        return merchantMatch || categoryMatch;
      });
      
      return isTransport;
    });

    return transportTransactions;
  }

  private detectCafeUsage(transactions: Transaction[]): Transaction[] {
    const cafeTransactions = transactions.filter(transaction => {
      const merchantName = transaction.merchantName?.toLowerCase() || '';
      const categoryName = transaction.categoryName?.toLowerCase() || '';
      
      const isCafe = this.cafeKeywords.some(keyword => {
        const keywordLower = keyword.toLowerCase();
        const merchantMatch = merchantName.includes(keywordLower);
        const categoryMatch = categoryName.includes(keywordLower);
        
        return merchantMatch || categoryMatch;
      });
      
      return isCafe;
    });

    return cafeTransactions;
  }

}

export const challengeDetectionService = new ChallengeDetectionService();