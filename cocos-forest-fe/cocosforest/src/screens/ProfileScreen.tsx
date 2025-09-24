import * as React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  SafeAreaView,
  Modal,
  Alert,
  BackHandler,
  ActivityIndicator
} from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import { 
  fetchBanks, 
  fetchAccountProducts, 
  fetchUserAccounts, 
  fetchCardProducts, 
  fetchUserCards,
  fetchUserProfile,
  connectUserCard,
  createDemandDepositAccount,
  healthCheck,
  type Bank,
  type AccountProduct,
  type UserAccount,
  type CardProduct,
  type UserCard as UserCardType,
  type UserProfile,
  type ConnectCardRequest
} from '../api/finance';
import { useAuthStore } from '../store/authStore';
// import ProfileEditModal from '../components/profile/ProfileEditModal';
// import LogoutModal from '../components/profile/LogoutModal';
// import WithdrawModal from '../components/profile/WithdrawModal';
// import BankSelectionModal from '../components/profile/BankSelectionModal';
// import AccountProductModal from '../components/profile/AccountProductModal';
// import AccountSelectionModal from '../components/profile/AccountSelectionModal';
// import AccountCard from '../components/profile/AccountCard';
// import UserCard from '../components/profile/UserCard';
// import AccountMenuModal from '../components/profile/AccountMenuModal';
import { getBankColor, getBankIcon, getCardColor } from '../utils/bankUtils';
import { getErrorMessage, handleApiError } from '../utils/errorUtils';

const ProfileScreen = () => {
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
  const [isLogoutModalVisible, setIsLogoutModalVisible] = React.useState(false);
  const [isWithdrawModalVisible, setIsWithdrawModalVisible] = React.useState(false);
  const [withdrawInput, setWithdrawInput] = React.useState('');
  const [isBankSelectionModalVisible, setIsBankSelectionModalVisible] = React.useState(false);
  const [selectedAccountType, setSelectedAccountType] = React.useState<'온라인계좌' | '신용카드'>('온라인계좌');
  
  const [banks, setBanks] = React.useState<Bank[]>([]);
  const [cardProducts, setCardProducts] = React.useState<CardProduct[]>([]);
  const [userAccounts, setUserAccounts] = React.useState<UserAccount[]>([]);
  const [userCards, setUserCards] = React.useState<UserCardType[]>([]);
  const [selectedBank, setSelectedBank] = React.useState<Bank | null>(null);
  const [accountProducts, setAccountProducts] = React.useState<AccountProduct[]>([]);
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
  const [isAccountProductModalVisible, setIsAccountProductModalVisible] = React.useState(false);
  const [isAccountMenuModalVisible, setIsAccountMenuModalVisible] = React.useState(false);
  const [selectedAccountForMenu, setSelectedAccountForMenu] = React.useState<UserAccount | null>(null);
  const [isAccountSelectionModalVisible, setIsAccountSelectionModalVisible] = React.useState(false);
  const [selectedCardForConnection, setSelectedCardForConnection] = React.useState<CardProduct | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = React.useState(false);
  
  const { user, isAuthenticated } = useAuthStore();
  
  const userId = Number(user?.id) || 1;

  const loadUserProfile = async () => {
  try {
    setIsLoadingProfile(true);
    const profile = await fetchUserProfile(userId);
    setUserProfile(profile);
    
    setProfileData({
      name: profile.nickname,
      phone: profile.phoneNumber || '',
      nickname: profile.nickname,
      email: profile.email,
      verificationCode: ''
    });
  } catch (error) {
    console.error('❌ 사용자 정보 로드 실패:', error);
    Alert.alert('알림', '사용자 정보를 불러오는데 실패했습니다.');
  } finally {
    setIsLoadingProfile(false);
  }
};

  React.useEffect(() => {
    loadUserCards();
  }, [userId]);

  const settingsMenu = [
    { id: 1, title: '알림 설정', icon: '🔔' },
    { id: 2, title: '개인정보 보호', icon: '🛡️' },
    { id: 3, title: '도움말', icon: '❓' },
    { id: 4, title: '이용약관', icon: '📄' },
    { id: 5, title: '로그아웃', icon: '🚪', isLogout: true }
  ];

  const withdrawMenu = [
    { id: 1, title: '회원탈퇴', isWithdraw: true }
  ];

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

  const handleLogoutPress = () => {
    setIsLogoutModalVisible(true);
  };

  const handleWithdrawPress = () => {
    setIsWithdrawModalVisible(true);
  };

  const handleLogoutCancel = () => {
    setIsLogoutModalVisible(false);
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
          onPress: () => {
            try {
              setIsLogoutModalVisible(false);
              
              setTimeout(() => {
                Alert.alert(
                  '로그아웃 완료',
                  '성공적으로 로그아웃되었습니다.\n앱을 종료합니다.',
                  [
                    {
                      text: '확인',
                      onPress: () => {
                        BackHandler.exitApp();
                      }
                    }
                  ]
                );
              }, 500);
            } catch (error) {
              console.error('로그아웃 처리 중 오류:', error);
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
      console.error('❌ 은행 목록 로드 실패:', error);
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
      console.error('❌ 카드 상품 로드 실패:', error);
      Alert.alert('오류', handleApiError(error, '카드 상품을 불러오는데 실패했습니다.'));
    }
  };

  const loadAccountProducts = async (bankCode: string) => {
    try {
      setIsLoading(true);
      const products = await fetchAccountProducts(bankCode);
      setAccountProducts(products);
    } catch (error: any) {
      console.error('❌ 계좌 상품 로드 실패:', error);
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
      console.error('❌ 사용자 계좌 로드 실패:', error);
      const errorMessage = getErrorMessage(error);
      Alert.alert(
        '계좌 정보 오류',
        `계좌 목록을 불러올 수 없습니다.\n\n백엔드 서버 상태를 확인해주세요:\n• API: GET /api/finance/accounts?userId=${userId} (파라미터 없음)\n• 백엔드에서 하드코딩된 사용자 사용\n• 에러: ${errorMessage}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserCards = async () => {
    try {
      const cards = await fetchUserCards();
      setUserCards(cards);
    } catch (error: any) {
      console.error('❌ 사용자 카드 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkBackendConnection = async () => {
    const isHealthy = await healthCheck();
    if (!isHealthy) {
      Alert.alert(
        '서버 연결 실패',
        '확인사항:\n• 백엔드 서버가 실행 중인가요?\n• 서버 주소: http://10.0.2.2:8080\n• 방화벽 설정을 확인해주세요.',
        [{ text: '확인' }]
      );
    }
    return isHealthy;
  };

  React.useEffect(() => {
    const initializeData = async () => {
      const isConnected = await checkBackendConnection();
      if (isConnected) {
        await Promise.all([
          loadUserProfile(),
          loadUserAccounts()
        ]);
      }
    };
    
    initializeData();
  }, []);

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
        console.error('❌ 데이터 로드 중 일부 실패:', error);
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
    try {
      setIsLoading(true);
      
      const result = await createDemandDepositAccount(userId, {
        accountTypeUniqueNo: product.accountTypeUniqueNo
      });
      
      Alert.alert('계좌 생성 완료', 
        `${product.bankName} ${product.accountName} 계좌가 생성되었습니다.\n계좌번호: ${result.accountNo}`, [
        { text: '확인', onPress: () => {
          handleBankSelectionClose();
          loadUserAccounts();
        }}
      ]);
    } catch (error: any) {
      console.error('❌ 계좌 생성 실패:', error);
      console.error('❌ 에러 상세:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      let errorMessage = '계좌 생성에 실패했습니다.';
      let errorDetails = '';
      
      if (error.response?.status === 500) {
        errorMessage = '서버 내부 오류가 발생했습니다.';
        errorDetails = '\n\n🔍 실제 원인:\n' +
                      '• 백엔드에서 userId=1로 하드코딩되어 있음\n' +
                      '• userId=1에 대한 linkage 데이터가 DB에 없음\n' +
                      '• 프론트에서 다른 userId 보내도 백엔드는 무시함\n\n' +
                      '⚠️ 백엔드 수정 필요:\n' +
                      '• AccountServiceImpl.java 34줄\n' +
                      '• userId = 1L → 실제 요청 파라미터 사용\n\n' +
                      '📋 요청 정보:\n' +
                      `• 사용자 ID: ${userId}\n` +
                      `• 계좌 상품: ${product.accountName}\n` +
                      `• 은행: ${product.bankName}\n` +
                      `• 상품 코드: ${product.accountTypeUniqueNo}`;
      } else if (error.response?.status === 400) {
        errorMessage = '잘못된 요청 데이터입니다.';
        errorDetails = '\n• 계좌 상품 정보를 확인해주세요';
      } else if (error.response?.status === 404) {
        errorMessage = '계좌 상품을 찾을 수 없습니다.';
        errorDetails = '\n• 선택한 상품이 유효한지 확인해주세요';
      }
      
      Alert.alert('계좌 생성 실패', errorMessage + errorDetails);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardApplication = (cardProduct: CardProduct) => {
    setSelectedCardForConnection(cardProduct);
    setIsAccountSelectionModalVisible(true);
  };

  const handleCardDisconnect = (card: UserCardType) => {
    Alert.alert(
      `${card.cardName} 카드 연결 해제`,
      '해제 후에는 해당 카드의 거래 내역을 더 이상 추적할 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '연결 해제', 
          style: 'destructive',
          onPress: () => confirmCardDisconnect(card)
        }
      ]
    );
  };

  const confirmCardDisconnect = (card: UserCardType) => {
    try {
      setUserCards(prev => prev.filter(c => c.userCardId !== card.userCardId));
      
      Alert.alert('완료', `${card.cardName} 카드 연결이 해제되었습니다.`);
      
    } catch (error) {
      console.error('❌ 카드 연결 해제 실패:', error);
      Alert.alert('오류', '카드 연결 해제 중 오류가 발생했습니다.');
    }
  };

  const handleAccountMenuPress = (account: UserAccount) => {
    setSelectedAccountForMenu(account);
    setIsAccountMenuModalVisible(true);
  };

  const handleAccountMenuClose = () => {
    setIsAccountMenuModalVisible(false);
    setSelectedAccountForMenu(null);
  };

  const handleAccountDisconnect = () => {
    if (!selectedAccountForMenu) return;
    
    Alert.alert(
      '계좌 연결 해제',
      `${selectedAccountForMenu.accountNo} 계좌 연결을 해제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '연결 해제',
          style: 'destructive',
          onPress: () => {
            setUserAccounts(prev => 
              prev.filter(account => account.accountId !== selectedAccountForMenu.accountId)
            );
            Alert.alert('완료', '계좌 연결이 해제되었습니다.');
            handleAccountMenuClose();
          }
        }
      ]
    );
  };

  const handleAccountSelectionForCard = async (account: UserAccount) => {
    if (!selectedCardForConnection) return;
    
    try {
      setIsLoading(true);
      
      const connectRequest: ConnectCardRequest = {
        productId: Number(selectedCardForConnection.cardUniqueNo),
        withdrawalAccountNo: account.accountNo,
        withdrawalDate: '25'
      };
      
      await connectUserCard(connectRequest, userId);
      
      Alert.alert('성공', `${selectedCardForConnection.name} 카드가 성공적으로 연결되었습니다.`);
      
      setIsAccountSelectionModalVisible(false);
      setSelectedCardForConnection(null);
      
      loadUserCards();
      
    } catch (error: any) {
      console.error('❌ 카드 연결 실패:', error);
      console.error('❌ 에러 상세:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      let errorDetails = '';
      if (error.response?.status === 500) {
        errorDetails = '\n\n🔍 디버깅 정보:\n' +
                      `• 카드 ID: ${selectedCardForConnection?.cardUniqueNo}\n` +
                      `• 계좌번호: ${account.accountNo}\n` +
                      `• 출금일: 25\n` +
                      `• 사용자 ID: ${userId}\n\n`;
      }
      
      Alert.alert(
        '카드 연결 실패',
        '카드 연결 중 오류가 발생했습니다.' + errorDetails
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView style={commonStyles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>프로필</Text>
          <View style={styles.headerRight}>
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
              <Text style={styles.settingsIconText}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Image 
              source={require('../../assets/coco-character.png')} 
              style={styles.avatar}
              resizeMode="contain"
            />
          </View>
          <View style={styles.profileInfo}>
            {isLoadingProfile ? (
              <ActivityIndicator size="small" color="#6366F1" />
            ) : (
              <>
                <Text style={styles.userName}>
                  {userProfile?.nickname || '사용자'}
                </Text>
                <Text style={styles.userTitle}>에코 워리어</Text>
                <View style={styles.levelContainer}>
                  <Text style={styles.levelText}>레벨 12</Text>
                  <Text style={styles.pointsText}>3,500 P</Text>
                </View>
              </>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>연결된 계좌</Text>
          </View>
          
          {isLoading && userAccounts.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6366F1" />
              <Text style={styles.loadingText}>계좌 정보를 불러오는 중...</Text>
            </View>
          ) : userAccounts.length === 0 ? (
            <View style={styles.emptyAccountsContainer}>
              <Text style={styles.emptyAccountsText}>
                연결된 계좌가 없습니다.{'\n'}
                계좌를 연결하여 탄소 발자국을 추적해보세요.
              </Text>
            </View>
          ) : (
            userAccounts.map((account) => (
              <View key={account.accountId} style={styles.tempCard}>
                <Text>계좌: {account.accountNo}</Text>
              </View>
            ))
          )}

          <TouchableOpacity style={styles.addAccountButton} onPress={handleAddAccount}>
            <View style={styles.addAccountIcon}>
              <Text style={styles.addAccountIconText}>+</Text>
            </View>
            <Text style={styles.addAccountText}>계좌/카드 등록하기</Text>
          </TouchableOpacity>
        </View>

        {userCards.length > 0 && (
          <View style={[styles.section, styles.cardsSection]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>연결된 카드</Text>
              <Text style={styles.cardCount}>{userCards.length}개</Text>
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cardsScrollContainer}
              style={styles.cardsScrollView}
              nestedScrollEnabled={true}
            >
              {userCards.map((card, index) => (
                <View key={card.userCardId} style={styles.tempCard}>
                  <Text>카드: {card.cardName}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>설정</Text>
          {settingsMenu.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.settingItem, item.isLogout && styles.logoutItem]}
              onPress={item.isLogout ? handleLogoutPress : undefined}
            >
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>{item.icon}</Text>
                <Text style={[styles.settingText, item.isLogout && styles.logoutText]}>
                  {item.title}
                </Text>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.withdrawSection}>
          {withdrawMenu.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.withdrawItem}
              onPress={handleWithdrawPress}
            >
              <Text style={styles.withdrawText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* <ProfileEditModal
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

      <LogoutModal
        visible={isLogoutModalVisible}
        onCancel={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
      />

      <WithdrawModal
        visible={isWithdrawModalVisible}
        onCancel={handleWithdrawCancel}
        onConfirm={handleWithdrawConfirm}
        withdrawInput={withdrawInput}
        onInputChange={handleWithdrawInputChange}
      />

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
        getBankIcon={getBankIcon}
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

      <AccountMenuModal
        visible={isAccountMenuModalVisible}
        onClose={handleAccountMenuClose}
        selectedAccount={selectedAccountForMenu}
        banks={banks}
        onDisconnect={handleAccountDisconnect}
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
      /> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  debugButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  debugButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  settingsIcon: {
    padding: 8,
  },
  settingsIconText: {
    fontSize: 20,
  },
  profileCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  userTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  levelText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
  },
  pointsText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  cardCount: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyAccountsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyAccountsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  emptyAccountsIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  emptyAccountsIcon: {
    fontSize: 24,
    opacity: 0.3,
  },
  addAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FF',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  addAccountIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  addAccountIconText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addAccountText: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '600',
  },
  cardsSection: {
    paddingBottom: 12,
  },
  cardsScrollContainer: {
    paddingRight: 20,
  },
  cardsScrollView: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  settingText: {
    fontSize: 16,
    color: '#000',
  },
  logoutText: {
    color: '#EF4444',
  },
  settingArrow: {
    fontSize: 18,
    color: '#9CA3AF',
  },
  withdrawSection: {
    marginHorizontal: 20,
    marginBottom: 32,
  },
  withdrawItem: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  withdrawText: {
    fontSize: 14,
    color: '#9CA3AF',
    textDecorationLine: 'underline',
  },
  tempCard: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    margin: 5,
    borderRadius: 5,
  },
});

export default ProfileScreen;