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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '../config/env';
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
  type Bank,
  type AccountProduct,
  type UserAccount,
  type CardProduct,
  type UserCard as UserCardType,
  type UserProfile,
  type ConnectCardRequest
} from '../api/finance';
import { useAuthStore } from '../store/authStore';
import BankSelectionModal from '../components/profile/BankSelectionModal';
import AccountProductModal from '../components/profile/AccountProductModal';
import AccountSelectionModal from '../components/profile/AccountSelectionModal';
import AccountMenuModal from '../components/profile/AccountMenuModal';
import { getBankColor, getCardColor } from '../utils/bankUtils';
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

  // 은행 로고 가져오기 함수
  const getBankLogo = (bankCode: string) => {
    const logoMap: { [key: string]: any } = {
      '001': require('../../assets/bank-logos/bok.png'),
      '002': require('../../assets/bank-logos/kdb.png'),
      '003': require('../../assets/bank-logos/ibk.png'),
      '004': require('../../assets/bank-logos/kb.png'),
      '011': require('../../assets/bank-logos/nh.png'),
      '020': require('../../assets/bank-logos/woori.png'),
      '023': require('../../assets/bank-logos/sc.png'),
      '027': require('../../assets/bank-logos/citi.png'),
      '032': require('../../assets/bank-logos/dgb.png'),
      '034': require('../../assets/bank-logos/kjb.png'),
      '035': require('../../assets/bank-logos/jb.png'),
      '037': require('../../assets/bank-logos/jbbank.png'),
      '039': require('../../assets/bank-logos/knb.png'),
      '045': require('../../assets/bank-logos/kfcc.png'),
      '081': require('../../assets/bank-logos/hana.png'),
      '088': require('../../assets/bank-logos/shinhan.png'),
      '090': require('../../assets/bank-logos/kakao.png'),
      '999': require('../../assets/bank-logos/ssafy-bank.png')
    };
    return logoMap[bankCode] || null;
  };

  const loadUserProfile = async () => {
  try {
    setIsLoadingProfile(true);
    
    // GET /api/user/myprofile API 호출
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
      
      setProfileData({
        name: profile.nickname,
        phone: '',
        nickname: profile.nickname,
        email: '',
        verificationCode: ''
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
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        loadUserProfile(),
        loadUserAccounts(),
        loadBanks()
      ]);
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
      
      Alert.alert('계좌 생성 실패', '계좌 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
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
          onPress: () => confirmCardDisconnect(card)
        }
      ]
    );
  };

  const confirmCardDisconnect = (card: UserCardType) => {
    try {
      setUserCards(prev => prev.filter(c => c.userCardId !== card.userCardId));
      
      Alert.alert('✅ 완료', `${card.cardName} 카드 연결이 해제되었습니다.`);
      
    } catch (error) {
      Alert.alert('❌ 오류', '카드 연결 해제 중 오류가 발생했습니다.');
    }
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

  const handleAccountDelete = (account: UserAccount) => {
    Alert.alert(
      '🏦 계좌 연결 해제',
      `계좌번호: ${account.accountNo}\n\n이 계좌 연결을 해제하시겠습니까?\n\n⚠️ 해제 후에는 해당 계좌의 거래 내역을 더 이상 추적할 수 없습니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '연결 해제',
          style: 'destructive',
          onPress: () => {
            setUserAccounts(prev => 
              prev.filter(acc => acc.accountId !== account.accountId)
            );
            Alert.alert('✅ 완료', '계좌 연결이 해제되었습니다.');
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
        productId: selectedCardForConnection.productId,
        withdrawalAccountNo: account.accountNo,
        withdrawalDate: '25'
      };
      
      await connectUserCard(connectRequest, userId);
      
      Alert.alert('성공', `${selectedCardForConnection.name} 카드가 성공적으로 연결되었습니다.`);
      
      setIsAccountSelectionModalVisible(false);
      setSelectedCardForConnection(null);
      
      loadUserCards();
      
    } catch (error: any) {
      
      let errorMessage = '카드 연결에 실패했습니다.';
      
      Alert.alert(
        '카드 연결 실패',
        errorMessage
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
                  <Text style={styles.pointsText}>{userProfile?.currentBalance || 0} P</Text>
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
            <View>
              {userAccounts.map((account) => {
                const bank = banks.find(b => b.bankCode === account.bankCode);
                const bankName = bank?.bankName || `은행 ${account.bankCode}`;
                const bankLogo = getBankLogo(account.bankCode);
                
                return (
                  <View key={account.accountId} style={styles.tempCard}>
                    <View style={styles.cardHeader}>
                      <View style={styles.bankInfo}>
                        {bankLogo && (
                          <Image 
                            source={bankLogo} 
                            style={styles.bankLogo}
                            resizeMode="contain"
                          />
                        )}
                        <Text style={styles.tempCardTitle}>{bankName}</Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.menuButton}
                        onPress={() => handleAccountMenuPress(account)}
                      >
                        <Text style={styles.menuButtonText}>⋯</Text>
                      </TouchableOpacity>
                    </View>
              <Text style={styles.tempCardText}>계좌: {account.accountNo}</Text>
                  </View>
                );
              })}
            </View>
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
          <View key={card.userCardId} style={styles.cardItemContainer}>
            <View style={[styles.cardContainer, { backgroundColor: getCardColor(index) }]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>COCO</Text>
                <TouchableOpacity 
                  style={styles.cardMenuButton}
                  onPress={() => handleCardMenuPress(card)}
                >
                  <Text style={styles.cardMenuButtonText}>⋯</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardName}>{card.cardName}</Text>
                <Text style={styles.cardDescription}>환경을 생각하는 카드</Text>
              </View>
              <View style={styles.cardFooter}>
                <View style={styles.cardChip}>
                  <Text style={styles.cardChipText}>ECO</Text>
                </View>
                <Text style={styles.cardNumber}>•••• {card.userCardId.toString().slice(-4)}</Text>
              </View>
            </View>
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
      />
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
    padding: 20,
    backgroundColor: '#FFFFFF',
    margin: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#6366F1',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bankInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bankLogo: {
    width: 36,
    height: 36,
    marginRight: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    padding: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tempCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  tempCardText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  menuButton: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  menuButtonText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  accountsScrollContainer: {
    paddingRight: 20,
  },
  accountsScrollView: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  cardItemContainer: {
    width: 280,
    height: 175,
    marginRight: 16,
  },
  cardContainer: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1.5,
  },
  cardMenuButton: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardMenuButtonText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  cardBody: {
    flex: 1,
    justifyContent: 'center',
  },
  cardName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  cardDescription: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  cardChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  cardChipText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  cardNumber: {
    fontSize: 8,
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 1,
  },
});

export default ProfileScreen;