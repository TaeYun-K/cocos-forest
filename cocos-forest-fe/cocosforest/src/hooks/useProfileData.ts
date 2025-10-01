import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '../config/env';
import {
  fetchBanks,
  fetchAccountProducts,
  fetchUserAccounts,
  fetchCardProducts,
  fetchUserCards,
  connectUserCard,
  createDemandDepositAccount,
  checkUserLinkage,
  registerUserLinkage,
  type Bank,
  type AccountProduct,
  type UserAccount,
  type CardProduct,
  type UserCard,
  type UserProfile,
  type ConnectCardRequest
} from '../api/finance';
import { fetchForestInfo, fetchPoints, type ForestInfoDto } from '../api/home';
import { getErrorMessage, handleApiError } from '../utils/errorUtils';

export const useProfileData = (userId: number) => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [cardProducts, setCardProducts] = useState<CardProduct[]>([]);
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>([]);
  const [userCards, setUserCards] = useState<UserCard[]>([]);
  const [accountProducts, setAccountProducts] = useState<AccountProduct[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [forestInfo, setForestInfo] = useState<ForestInfoDto | null>(null);
  const [points, setPoints] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  const loadUserProfile = async () => {
    try {
      setIsLoadingProfile(true);

      const response = await fetch('https://j13e205.p.ssafy.io/dev/api/user/myprofile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await AsyncStorage.getItem(ENV.AUTH_TOKEN_KEY)}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.isSuccess && data.result) {
        const profile = data.result;
        setUserProfile({
          nickname: profile.nickname,
          currentBalance: profile.currentBalance,
          phoneNumber: '',
          email: ''
        });
      } else {
        throw new Error(data.message || '프로필 정보를 가져올 수 없습니다.');
      }
    } catch (error) {
      Alert.alert('알림', '사용자 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const loadHomeData = async () => {
    try {
      const [forestData, pointsData] = await Promise.all([
        fetchForestInfo(),
        fetchPoints()
      ]);

      setForestInfo(forestData);
      setPoints(pointsData);
    } catch (error) {
      console.error('홈 데이터 로드 실패:', error);
    }
  };

  const loadBanks = async () => {
    try {
      setIsLoading(true);
      const banksData = await fetchBanks();

      const sortedBanks = banksData.sort((a, b) => {
        if (a.bankCode === '999') return -1;
        if (b.bankCode === '999') return 1;
        return a.bankCode.localeCompare(b.bankCode);
      });

      setBanks(sortedBanks);
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);
      Alert.alert(
        '네트워크 오류',
        `은행 목록을 불러올 수 없습니다.\n\n백엔드 서버 상태를 확인해주세요:\n• 서버 URL: http://localhost:8080\n• 에러: ${errorMessage}\n\n서버가 실행 중인지 확인해주세요.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadCardProducts = async () => {
    try {
      const cardData = await fetchCardProducts();
      setCardProducts(cardData);
    } catch (error: any) {
      Alert.alert('오류', handleApiError(error, '카드 상품을 불러오는데 실패했습니다.'));
    }
  };

  const loadAccountProducts = async (bankCode: string) => {
    try {
      setIsLoading(true);
      const products = await fetchAccountProducts(bankCode);
      setAccountProducts(products);
    } catch (error: any) {
      Alert.alert('오류', handleApiError(error, '계좌 상품을 불러오는데 실패했습니다.'));
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserAccounts = async () => {
    try {
      setIsLoading(true);
      const accounts = await fetchUserAccounts(userId);
      setUserAccounts(accounts);
    } catch (error: any) {
      Alert.alert('오류', '계좌 목록을 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserCards = async () => {
    try {
      const cards = await fetchUserCards();
      setUserCards(cards);
    } catch (error: any) {
      // Silent fail
    } finally {
      setIsLoading(false);
    }
  };

  const createAccount = async (accountTypeUniqueNo: string, productName: string, bankName: string) => {
    try {
      setIsLoading(true);

      // 1. 사용자 등록 여부 확인
      const isRegistered = await checkUserLinkage();

      // 2. 미등록 시 사용자 등록
      if (!isRegistered) {
        try {
          await registerUserLinkage();
          Alert.alert('금융 연동 등록', 'SSAFY 금융 서비스에 등록되었습니다.');
        } catch (error: any) {
          Alert.alert('등록 실패', 'SSAFY 금융 연동 등록에 실패했습니다.');
          return false;
        }
      }

      // 3. 계좌 생성
      const result = await createDemandDepositAccount(userId, {
        accountTypeUniqueNo
      });

      Alert.alert('계좌 생성 완료',
        `${bankName} ${productName} 계좌가 생성되었습니다.\n계좌번호: ${result.accountNo}`
      );

      await loadUserAccounts();
      return true;
    } catch (error: any) {
      Alert.alert('계좌 생성 실패', '계좌 생성 중 오류가 발생했습니다.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const connectCard = async (connectRequest: ConnectCardRequest, cardName: string) => {
    try {
      setIsLoading(true);

      await connectUserCard(connectRequest, userId);

      Alert.alert('성공', `${cardName} 카드가 성공적으로 연결되었습니다.`);

      await loadUserCards();
      return true;
    } catch (error: any) {
      Alert.alert(
        '카드 연결 실패',
        '카드 연결에 실패했습니다.'
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectCard = (card: UserCard) => {
    setUserCards(prev => prev.filter(c => c.userCardId !== card.userCardId));
    Alert.alert('✅ 완료', `${card.cardName} 카드 연결이 해제되었습니다.`);
  };

  const disconnectAccount = (account: UserAccount) => {
    setUserAccounts(prev =>
      prev.filter(acc => acc.accountId !== account.accountId)
    );
    Alert.alert('✅ 완료', '계좌 연결이 해제되었습니다.');
  };

  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        loadUserProfile(),
        loadUserAccounts(),
        loadBanks(),
        loadHomeData()
      ]);
    };

    initializeData();
  }, []);

  useEffect(() => {
    loadUserCards();
  }, [userId]);

  return {
    // State
    banks,
    cardProducts,
    userAccounts,
    userCards,
    accountProducts,
    userProfile,
    forestInfo,
    points,
    isLoading,
    isLoadingProfile,

    // Actions
    loadBanks,
    loadCardProducts,
    loadAccountProducts,
    loadUserAccounts,
    loadUserCards,
    createAccount,
    connectCard,
    disconnectCard,
    disconnectAccount,
    setAccountProducts
  };
};