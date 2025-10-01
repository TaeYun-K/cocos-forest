import * as React from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  SafeAreaView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { commonStyles } from '../styles/commonStyles';
import { profileScreenStyles as styles } from '../styles/profile/profileScreenStyles';
import type {
  Bank,
  AccountProduct,
  UserAccount,
  CardProduct,
  UserCard as UserCardType,
  ConnectCardRequest
} from '../types/finance';
import { useAuthStore } from '../store/authStore';
import { useProfileData } from '../hooks/useProfileData';
import BankSelectionModal from '../components/profile/BankSelectionModal';
import AccountProductModal from '../components/profile/AccountProductModal';
import AccountSelectionModal from '../components/profile/AccountSelectionModal';
import ProfileEditModal from '../components/profile/ProfileEditModal';
import ProfileHeader from '../components/profile/ProfileHeader';
import AccountListSection from '../components/profile/AccountListSection';
import CardListSection from '../components/profile/CardListSection';
import SettingsMenu from '../components/profile/SettingsMenu';
import { getBankColor, getCardColor } from '../utils/bankUtils';
import { UnifiedHeader } from '../components/common';

interface ProfileScreenProps {
  route?: {
    params?: {
      openAccountModal?: boolean;
    };
  };
}

const ProfileScreen = ({ route }: ProfileScreenProps) => {
  const scrollViewRef = React.useRef<ScrollView>(null);
  const { user, isAuthenticated, logout } = useAuthStore();
  const userId = Number(user?.id) || 1;

  // 프로필 편집 관련 상태
  const [isEditModalVisible, setIsEditModalVisible] = React.useState(false);
  const [profileData, setProfileData] = React.useState({
    name: '',
    phone: '',
    nickname: '',
    email: '',
    verificationCode: ''
  });
  const [nicknameError, setNicknameError] = React.useState('');
  const [nicknameChecked, setNicknameChecked] = React.useState(false);
  const [nicknameAvailable, setNicknameAvailable] = React.useState(false);
  const [emailVerificationSent, setEmailVerificationSent] = React.useState(false);

  // 회원 탈퇴 관련 상태
  const [isWithdrawModalVisible, setIsWithdrawModalVisible] = React.useState(false);
  const [withdrawInput, setWithdrawInput] = React.useState('');

  // 모달 관련 상태
  const [isBankSelectionModalVisible, setIsBankSelectionModalVisible] = React.useState(false);
  const [selectedAccountType, setSelectedAccountType] = React.useState<'온라인계좌' | '신용카드'>('온라인계좌');
  const [selectedBank, setSelectedBank] = React.useState<Bank | null>(null);
  const [isAccountProductModalVisible, setIsAccountProductModalVisible] = React.useState(false);
  const [isAccountSelectionModalVisible, setIsAccountSelectionModalVisible] = React.useState(false);
  const [selectedCardForConnection, setSelectedCardForConnection] = React.useState<CardProduct | null>(null);

  // 커스텀 훅 사용
  const {
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
    loadBanks,
    loadCardProducts,
    loadAccountProducts,
    loadUserAccounts,
    createAccount,
    connectCard,
    disconnectCard,
    disconnectAccount,
    setAccountProducts
  } = useProfileData(userId);

  // 프로필 데이터가 로드되면 편집 폼에 반영
  React.useEffect(() => {
    if (userProfile) {
      setProfileData({
        name: userProfile.nickname,
        phone: '',
        nickname: userProfile.nickname,
        email: '',
        verificationCode: ''
      });
    }
  }, [userProfile]);

  // 탭이 포커스될 때 최상단으로 스크롤
  useFocusEffect(
    React.useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }, [])
  );

  const handleEditProfile = () => {
    setIsEditModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsEditModalVisible(false);
    setNicknameError('');
    setNicknameChecked(false);
    setNicknameAvailable(false);
    setEmailVerificationSent(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'nickname') {
      setNicknameChecked(false);
      setNicknameAvailable(false);
      setNicknameError('');
    }
  };

  const handleNicknameCheck = () => {
    if (!profileData.nickname.trim()) {
      setNicknameError('닉네임을 입력해주세요.');
      setNicknameChecked(false);
      setNicknameAvailable(false);
      return;
    }

    const isDuplicate = profileData.nickname === '친환경지민';
    
    setNicknameChecked(true);
    setNicknameAvailable(!isDuplicate);
    
    if (isDuplicate) {
      setNicknameError('이미 사용 중인 닉네임입니다');
    } else {
      setNicknameError('사용가능한 닉네임입니다');
    }
  };

  const handleEmailVerification = () => {
    setEmailVerificationSent(true);
    Alert.alert('인증코드 발송', '인증코드가 이메일로 발송되었습니다.');
  };

  const handleSaveProfile = () => {
    Alert.alert('저장 완료', '프로필이 성공적으로 저장되었습니다.');
    handleCloseModal();
  };

  const handleWithdrawPress = () => {
    setIsWithdrawModalVisible(true);
  };

  const handleLogoutConfirm = () => {
    Alert.alert(
      '로그아웃',
      '정말로 로그아웃하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            try {
              // authStore의 logout 메서드 호출
              await logout();

              Alert.alert(
                '로그아웃 완료',
                '성공적으로 로그아웃되었습니다.',
                [{ text: '확인' }]
              );
            } catch (error) {
              console.error('로그아웃 실패:', error);
              Alert.alert(
                '로그아웃 실패',
                '로그아웃 중 오류가 발생했습니다.',
                [{ text: '확인' }]
              );
            }
          }
        }
      ]
    );
  };

  const handleWithdrawCancel = () => {
    setIsWithdrawModalVisible(false);
    setWithdrawInput('');
  };

  const handleWithdrawConfirm = () => {
    Alert.alert('회원탈퇴 완료', '회원탈퇴가 완료되었습니다.');
    setIsWithdrawModalVisible(false);
    setWithdrawInput('');
  };

  const handleWithdrawInputChange = (text: string) => {
    setWithdrawInput(text);
  };

  // 다른 화면에서 계좌 연결 모달을 열도록 요청한 경우
  React.useEffect(() => {
    if (route?.params?.openAccountModal) {
      // 잠깐 지연 후 모달 열기 (화면 전환 완료 후)
      const timer = setTimeout(() => {
        handleAddAccount();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [route?.params?.openAccountModal]);

  const handleAddAccount = async () => {
    setIsBankSelectionModalVisible(true);
    
    const loadPromises = [];
    if (banks.length === 0) {
      loadPromises.push(loadBanks());
    }
    loadPromises.push(loadCardProducts());
    
    if (loadPromises.length > 0) {
      try {
        await Promise.all(loadPromises);
      } catch (error) {
      }
    }
  };

  const handleAccountTypeSelect = (type: '온라인계좌' | '신용카드') => {
    setSelectedAccountType(type);
  };

  const handleBankSelectionClose = () => {
    setIsBankSelectionModalVisible(false);
    setIsAccountProductModalVisible(false);
  };

  const handleBankSelect = async (bank: Bank) => {
    if (selectedAccountType === '온라인계좌') {
      setSelectedBank(bank);
      await loadAccountProducts(bank.bankCode);
      setIsAccountProductModalVisible(true);
    }
  };

  const handleAccountProductSelect = async (product: AccountProduct) => {
    const success = await createAccount(
      product.accountTypeUniqueNo,
      product.accountName,
      product.bankName
    );

    if (success) {
      handleBankSelectionClose();
    }
  };

  const handleCardApplication = (cardProduct: CardProduct) => {
    const isAlreadyConnected = userCards.some(card => 
      card.productId === cardProduct.productId
    );
    
    if (isAlreadyConnected) {
      Alert.alert(
        '이미 연결된 카드',
        `${cardProduct.name} 카드는 이미 연결되어 있습니다.\n\n다른 카드를 선택하거나 기존 카드를 해제한 후 다시 시도해주세요.`,
        [{ text: '확인' }]
      );
      return;
    }
    
    setSelectedCardForConnection(cardProduct);
    setIsAccountSelectionModalVisible(true);
  };

  const handleCardMenuPress = (card: UserCardType) => {
    Alert.alert(
      '💳 카드 메뉴',
      `카드명: ${card.cardName}\n카드번호: •••• ${card.cardUniqueNo.slice(-4)}`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제하기',
          style: 'destructive',
          onPress: () => handleCardDisconnect(card)
        }
      ]
    );
  };

  const handleCardDisconnect = (card: UserCardType) => {
    Alert.alert(
      '💳 카드 연결 해제',
      `카드명: ${card.cardName}\n카드번호: •••• ${card.cardUniqueNo.slice(-4)}\n\n이 카드 연결을 해제하시겠습니까?\n\n⚠️ 해제 후에는 해당 카드의 거래 내역을 더 이상 추적할 수 없습니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '연결 해제',
          style: 'destructive',
          onPress: () => disconnectCard(card)
        }
      ]
    );
  };

  const handleAccountMenuPress = (account: UserAccount) => {
    Alert.alert(
      '🏦 계좌 메뉴',
      `계좌번호: ${account.accountNo}\n은행코드: ${account.bankCode}`,
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '삭제하기', 
          style: 'destructive',
          onPress: () => handleAccountDelete(account)
        }
      ]
    );
  };

  const handleAccountDelete = (account: UserAccount) => {
    Alert.alert(
      '🏦 계좌 연결 해제',
      `계좌번호: ${account.accountNo}\n\n이 계좌 연결을 해제하시겠습니까?\n\n⚠️ 해제 후에는 해당 계좌의 거래 내역을 더 이상 추적할 수 없습니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '연결 해제',
          style: 'destructive',
          onPress: () => disconnectAccount(account)
        }
      ]
    );
  };

  const handleAccountSelectionForCard = async (account: UserAccount) => {
    if (!selectedCardForConnection) return;

    const connectRequest: ConnectCardRequest = {
      productId: selectedCardForConnection.productId,
      withdrawalAccountNo: account.accountNo,
      withdrawalDate: '25'
    };

    const success = await connectCard(connectRequest, selectedCardForConnection.name);

    if (success) {
      setIsAccountSelectionModalVisible(false);
      setSelectedCardForConnection(null);
    }
  };

  return (
    <SafeAreaView style={commonStyles.safeContainer}>
      <ScrollView ref={scrollViewRef} style={commonStyles.scrollView} showsVerticalScrollIndicator={false}>
        <UnifiedHeader
          title="프로필"
          rightContent={
            <>
              {!isAuthenticated && (
                <TouchableOpacity
                  style={styles.debugButton}
                  onPress={() => {
                    Alert.alert('디버깅', 'API가 변경되어 파라미터 없이 호출됩니다.\n계좌 목록을 새로고침합니다.');
                    loadUserAccounts();
                  }}
                >
                  <Text style={styles.debugButtonText}>새로고침</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.settingsIcon} onPress={handleEditProfile}>
                <Ionicons name="settings-outline" size={24} color="#666" />
              </TouchableOpacity>
            </>
          }
        />

        <ProfileHeader
          userProfile={userProfile}
          points={points}
          treeCount={forestInfo?.aliveTreeCount || 0}
          isLoading={isLoadingProfile}
        />

        <AccountListSection
          userAccounts={userAccounts}
          banks={banks}
          isLoading={isLoading}
          onAccountMenuPress={handleAccountDelete}
          onAddAccount={handleAddAccount}
        />

        <CardListSection
          userCards={userCards}
          onCardMenuPress={handleCardMenuPress}
        />

        <SettingsMenu
          onLogout={handleLogoutConfirm}
          onWithdraw={handleWithdrawPress}
        />
      </ScrollView>

      <BankSelectionModal
        visible={isBankSelectionModalVisible}
        onClose={handleBankSelectionClose}
        banks={banks}
        cardProducts={cardProducts}
        selectedAccountType={selectedAccountType}
        onAccountTypeSelect={handleAccountTypeSelect}
        onBankSelect={handleBankSelect}
        onCardApplication={handleCardApplication}
        isLoading={isLoading}
        getBankColor={getBankColor}
        getCardColor={getCardColor}
      />

      <AccountProductModal
        visible={isAccountProductModalVisible}
        onClose={() => setIsAccountProductModalVisible(false)}
        selectedBank={selectedBank}
        accountProducts={accountProducts}
        onProductSelect={handleAccountProductSelect}
        isLoading={isLoading}
      />

      <AccountSelectionModal
        visible={isAccountSelectionModalVisible}
        onClose={() => {
          setIsAccountSelectionModalVisible(false);
          setSelectedCardForConnection(null);
        }}
        selectedCard={selectedCardForConnection}
        onAccountSelect={handleAccountSelectionForCard}
        userId={userId}
        banks={banks}
      />

      <ProfileEditModal
        visible={isEditModalVisible}
        onClose={handleCloseModal}
        profileData={profileData}
        onInputChange={handleInputChange}
        onNicknameCheck={handleNicknameCheck}
        onEmailVerification={handleEmailVerification}
        onSaveProfile={handleSaveProfile}
        nicknameError={nicknameError}
        nicknameChecked={nicknameChecked}
        nicknameAvailable={nicknameAvailable}
        emailVerificationSent={emailVerificationSent}
      />
    </SafeAreaView>
  );
};

export default ProfileScreen;