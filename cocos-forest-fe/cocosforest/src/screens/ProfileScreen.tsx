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
  TextInput,
  Alert,
  BackHandler,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { 
  fetchBanks, 
  fetchAccountProducts, 
  fetchUserAccounts, 
  fetchCardProducts, 
  fetchUserCards,
  connectUserCard,
  createDemandDepositAccount,
  healthCheck,
  type Bank,
  type AccountProduct,
  type UserAccount,
  type CardProduct,
  type UserCard,
  type ConnectCardRequest
} from '../api/finance';

// 계좌 선택 모달 컴포넌트
const AccountSelectionModal = ({ 
  visible, 
  onClose, 
  selectedCard, 
  onAccountSelect,
  userId,
  banks 
}: {
  visible: boolean;
  onClose: () => void;
  selectedCard: CardProduct | null;
  onAccountSelect: (account: UserAccount) => void;
  userId: number;
  banks: Bank[];
}) => {
  const [accounts, setAccounts] = React.useState<UserAccount[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (visible) {
      loadAccounts();
    }
  }, [visible]);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      console.log('🔄 모달 내에서 계좌 데이터 로드 시작...');
      const accountsData = await fetchUserAccounts(userId);
      console.log('📊 모달에서 로드한 계좌:', accountsData.length, '개');
      setAccounts(accountsData);
    } catch (error) {
      console.error('❌ 계좌 로드 실패:', error);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const getBankColor = (bankCode: string): string => {
    const colorMap: { [key: string]: string } = {
      '004': '#1E40AF', '088': '#0EA5E9', '081': '#059669',
      '020': '#DC2626', '090': '#FBBF24', '999': '#8B5CF6',
      '011': '#10B981', '023': '#F59E0B', '027': '#EF4444',
    };
    return colorMap[bankCode] || '#6B7280';
  };

  const getBankIcon = (bankCode: string, bankName: string): string => {
    const iconMap: { [key: string]: string } = {
      '004': '🏛️', '088': '🏦', '081': '🌟', '020': '💎',
      '090': '🍌', '999': '🎓', '011': '🌾', '023': '⭐', '027': '🏙️'
    };
    return iconMap[bankCode] || bankName.charAt(0);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* 헤더 */}
          <View style={styles.bankModalHeader}>
            <Text style={styles.bankModalTitle}>출금 계좌 선택</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.bankModalCloseButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* 선택된 카드 정보 */}
          {selectedCard && (
            <View style={styles.selectedCardInfo}>
              <Text style={styles.selectedCardTitle}>선택된 카드</Text>
              <View style={styles.selectedCardContainer}>
                <Text style={styles.selectedCardIcon}>💳</Text>
                <View style={styles.selectedCardDetails}>
                  <Text style={styles.selectedCardName}>{selectedCard.name}</Text>
                  <Text style={styles.selectedCardDescription}>{selectedCard.description}</Text>
                </View>
              </View>
            </View>
          )}

          {/* 디버깅 정보 */}
          <Text style={styles.debugText}>
            전체 계좌: {accounts.length}개 | 활성 계좌: {accounts.filter(account => account.status === 'ACTIVE').length}개
          </Text>

          {/* 계좌 목록 */}
          <View style={styles.accountSelectionContainer}>
            <Text style={styles.accountSelectionTitle}>출금할 계좌를 선택해주세요</Text>
            <Text style={styles.accountSelectionSubtitle}>
              카드 결제 시 선택한 계좌에서 자동으로 출금됩니다.
            </Text>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366F1" />
                <Text style={styles.loadingText}>계좌 정보를 불러오는 중...</Text>
              </View>
            ) : accounts.length > 0 ? (
              <View style={styles.accountListWrapper}>
                <Text style={styles.accountCountInfo}>총 {accounts.length}개 계좌</Text>
                <ScrollView 
                  style={styles.accountSelectionList}
                  showsVerticalScrollIndicator={true}
                  nestedScrollEnabled={true}
                >
                  {accounts.map((account) => (
                  <TouchableOpacity
                    key={account.accountId}
                    style={styles.accountSelectionItem}
                    onPress={() => onAccountSelect(account)}
                  >
                    <View style={styles.accountSelectionInfo}>
                      <View style={[styles.accountIcon, { backgroundColor: getBankColor(account.bankCode) }]}>
                        <Text style={styles.accountIconText}>
                          {getBankIcon(account.bankCode, banks.find(b => b.bankCode === account.bankCode)?.bankName || '알 수 없는 은행')}
                        </Text>
                      </View>
                      <View style={styles.accountDetails}>
                        <Text style={styles.accountName}>
                          {banks.find(b => b.bankCode === account.bankCode)?.bankName || '알 수 없는 은행'}
                        </Text>
                        <Text style={styles.accountNumber}>{account.accountNo}</Text>
                        <Text style={styles.accountCurrency}>{account.currencyName}</Text>
                        <View style={[
                          styles.accountStatusBadge, 
                          { backgroundColor: account.status === 'ACTIVE' ? '#10B981' : '#EF4444' }
                        ]}>
                          <Text style={styles.accountStatusText}>
                            {account.status === 'ACTIVE' ? '활성' : '비활성'}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <Text style={styles.accountSelectionArrow}>›</Text>
                  </TouchableOpacity>
                ))}
                </ScrollView>
              </View>
            ) : (
              <View style={styles.noAccountContainer}>
                <Text style={styles.noAccountIcon}>🏦</Text>
                <Text style={styles.noAccountTitle}>발급받은 계좌가 없습니다</Text>
                <Text style={styles.noAccountText}>
                  카드 연결을 위해서는{'\n'}먼저 계좌를 발급받아야 합니다.
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const ProfileScreen = () => {
  // 프로필 수정 모달 상태
  const [isEditModalVisible, setIsEditModalVisible] = React.useState(false);
  const [profileData, setProfileData] = React.useState({
    name: '김지민',
    phone: '010-1234-5678',
    nickname: '친환경지민',
    email: 'jimin@example.com',
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
  
  // API 데이터 상태
  const [banks, setBanks] = React.useState<Bank[]>([]);
  const [cardProducts, setCardProducts] = React.useState<CardProduct[]>([]);
  const [userAccounts, setUserAccounts] = React.useState<UserAccount[]>([]);
  const [userCards, setUserCards] = React.useState<UserCard[]>([]);
  const [selectedBank, setSelectedBank] = React.useState<Bank | null>(null);
  const [accountProducts, setAccountProducts] = React.useState<AccountProduct[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isAccountProductModalVisible, setIsAccountProductModalVisible] = React.useState(false);
  const [isAccountMenuModalVisible, setIsAccountMenuModalVisible] = React.useState(false);
  const [selectedAccountForMenu, setSelectedAccountForMenu] = React.useState<UserAccount | null>(null);
  const [isAccountSelectionModalVisible, setIsAccountSelectionModalVisible] = React.useState(false);
  const [selectedCardForConnection, setSelectedCardForConnection] = React.useState<CardProduct | null>(null);
  
  // 임시 사용자 ID (실제로는 인증 상태에서 가져와야 함)
  const userId = 1;

  // 사용자 카드 목록 로드 (백엔드 API 없음)
  const loadUserCards = async () => {
    try {
      console.log('💳 사용자 카드 목록 초기화 (백엔드 API 없음)');
      // 백엔드에 사용자 카드 목록 조회 API가 없으므로 빈 배열로 초기화
      setUserCards([]);
      console.log('✅ 사용자 카드 목록 초기화 완료');
    } catch (error) {
      console.error('❌ 사용자 카드 목록 초기화 실패:', error);
      setUserCards([]);
    }
  };

  React.useEffect(() => {
    loadUserCards();
  }, []);

  const connectedAccounts: Array<{
    id: number;
    bankName: string;
    lastSync: string;
    isConnected: boolean;
    icon: string;
  }> = [];

  // 하드코딩된 은행 목록은 제거하고 API에서 가져온 데이터를 사용

  // 하드코딩된 카드 목록은 제거하고 API에서 가져온 데이터를 사용

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

  // 프로필 수정 핸들러들
  const handleEditProfile = () => {
    setIsEditModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsEditModalVisible(false);
    setEmailVerificationSent(false);
    setNicknameChecked(false);
    setNicknameAvailable(false);
    setNicknameError('');
    setProfileData(prev => ({ ...prev, verificationCode: '' }));
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    
    // 닉네임이 변경되면 중복확인 상태 초기화
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

    // 실제로는 API 호출을 통해 중복 확인을 해야 합니다
    // 여기서는 예시로 '친환경지민'이 중복이라고 가정
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
    // 이메일 인증 로직
    setEmailVerificationSent(true);
    Alert.alert('인증코드 발송', '인증코드가 이메일로 발송되었습니다.');
  };

  const handleSaveProfile = () => {
    // 프로필 저장 로직
    Alert.alert('저장 완료', '프로필이 성공적으로 저장되었습니다.');
    handleCloseModal();
  };

  // 로그아웃 핸들러
  const handleLogoutPress = () => {
    setIsLogoutModalVisible(true);
  };

  // 회원탈퇴 핸들러
  const handleWithdrawPress = () => {
    setIsWithdrawModalVisible(true);
  };

  // 로그아웃 모달 관련 핸들러들
  const handleLogoutCancel = () => {
    setIsLogoutModalVisible(false);
  };

  const handleLogoutConfirm = () => {
    Alert.alert(
      '로그아웃 확인',
      '정말로 로그아웃 하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
          onPress: () => setIsLogoutModalVisible(false)
        },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: () => {
            try {
              // 모달 닫기
              setIsLogoutModalVisible(false);
              
              // 로그아웃 처리
              console.log('로그아웃 처리 시작...');
              
              // 실제 로그아웃 로직을 여기에 구현
              // 1. 로컬 스토리지 클리어
              // AsyncStorage.clear();
              
              // 2. 전역 상태 초기화
              // dispatch(logout());
              
              // 3. 앱 종료 또는 초기 화면으로 이동
              // 현재는 앱 종료로 처리
              setTimeout(() => {
                Alert.alert(
                  '로그아웃 완료',
                  '성공적으로 로그아웃되었습니다.\n앱을 종료합니다.',
                  [
                    {
                      text: '확인',
                      onPress: () => {
                        // Android에서 앱 종료
                        BackHandler.exitApp();
                      }
                    }
                  ]
                );
              }, 500);
              
            } catch (error) {
              console.error('로그아웃 중 오류 발생:', error);
              Alert.alert('오류', '로그아웃 중 오류가 발생했습니다.');
            }
          }
        }
      ]
    );
  };

  // API 호출 함수들
  const loadBanks = async () => {
    try {
      setIsLoading(true);
      console.log('🏦 은행 목록 로드 시작...');
      const banksData = await fetchBanks();
      
      // 싸피은행을 제일 위로 정렬
      const sortedBanks = banksData.sort((a, b) => {
        if (a.bankCode === '999') return -1; // 싸피은행을 맨 위로
        if (b.bankCode === '999') return 1;
        return a.bankCode.localeCompare(b.bankCode); // 나머지는 코드 순으로
      });
      
      setBanks(sortedBanks);
      console.log('✅ 은행 목록 로드 완료:', sortedBanks.length, '개');
      console.log('📋 은행 목록:', sortedBanks.map(bank => `${bank.bankCode}: ${bank.bankName}`));
    } catch (error) {
      console.error('❌ 은행 목록 로드 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      Alert.alert(
        '백엔드 연결 오류', 
        `은행 목록을 불러올 수 없습니다.\n\n백엔드 서버 상태를 확인해주세요:\n• 서버 URL: http://localhost:8080\n• 에러: ${errorMessage}\n\n서버가 실행 중인지 확인해주세요.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadCardProducts = async () => {
    try {
      setIsLoading(true);
      console.log('💳 카드 상품 목록 로드 시작...');
      const cardData = await fetchCardProducts();
      setCardProducts(cardData);
      console.log('✅ 카드 상품 목록 로드 완료:', cardData.length, '개');
    } catch (error) {
      console.error('❌ 카드 상품 목록 로드 실패:', error);
      Alert.alert('알림', '카드 상품 목록을 불러오는데 실패했습니다.\n잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // 사용자 카드 API가 백엔드에 없으므로 제거
  // const loadUserCards = async () => { ... };

  const loadUserAccounts = async () => {
    try {
      setIsLoading(true);
      console.log('👤 사용자 계좌 목록 로드 시작... (userId:', userId, ')');
      const accountsData = await fetchUserAccounts(userId);
      setUserAccounts(accountsData);
      console.log('✅ 사용자 계좌 목록 로드 완료:', accountsData.length, '개');
    } catch (error) {
      console.error('❌ 사용자 계좌 목록 로드 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      Alert.alert(
        '백엔드 연결 오류', 
        `계좌 목록을 불러올 수 없습니다.\n\n백엔드 서버 상태를 확인해주세요:\n• API: GET /api/finance/accounts/user/${userId}\n• 에러: ${errorMessage}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadAccountProducts = async (bankCode: string) => {
    try {
      setIsLoading(true);
      console.log('🏛️ 계좌 상품 목록 로드 시작... (bankCode:', bankCode, ')');
      const productsData = await fetchAccountProducts(bankCode);
      setAccountProducts(productsData);
      console.log('✅ 계좌 상품 목록 로드 완료:', productsData.length, '개');
    } catch (error) {
      console.error('❌ 계좌 상품 목록 로드 실패:', error);
      Alert.alert('알림', '계좌 상품 목록을 불러오는데 실패했습니다.\n잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // 백엔드 서버 연결 상태 확인
  const checkBackendConnection = async () => {
    console.log('🔍 백엔드 서버 연결 상태 확인 중...');
    const isHealthy = await healthCheck();
    if (isHealthy) {
      console.log('✅ 백엔드 서버 연결 성공');
    } else {
      console.log('❌ 백엔드 서버 연결 실패');
      Alert.alert(
        '서버 연결 실패',
        '백엔드 서버에 연결할 수 없습니다.\n\n확인사항:\n• 백엔드 서버가 실행 중인가요?\n• 서버 주소: http://10.0.2.2:8080\n• 방화벽 설정을 확인해주세요.',
        [
          { text: '확인', style: 'default' }
        ]
      );
    }
    return isHealthy;
  };

  // 컴포넌트 마운트 시 데이터 로드
  React.useEffect(() => {
    console.log('📱 ProfileScreen 마운트됨 - 초기 데이터 로드 시작');
    
    const initializeData = async () => {
      const isConnected = await checkBackendConnection();
      if (isConnected) {
        loadUserAccounts();
      }
    };
    
    initializeData();
  }, []);

  // 은행 선택 모달 핸들러들
  const handleAddAccount = async () => {
    setIsBankSelectionModalVisible(true);
    
    console.log('🔍 현재 banks 배열 상태:', banks.length, '개');
    console.log('📋 현재 banks 내용:', banks.map(bank => `${bank.bankCode}: ${bank.bankName}`));
    
    // 은행 목록, 카드 상품, 사용자 카드를 병렬로 로드
    const loadPromises = [];
    if (banks.length === 0) {
      console.log('⚠️ banks 배열이 비어있음 - API 호출 시도');
      loadPromises.push(loadBanks());
    } else {
      console.log('✅ banks 배열에 데이터 존재 - API 호출 생략');
    }
    
    // 카드 상품은 항상 최신 데이터로 로드
    console.log('💳 카드 상품 강제 로드 시작 (Mock 비활성화로 실제 API 사용)');
    loadPromises.push(loadCardProducts());
    
    if (loadPromises.length > 0) {
      console.log('🔄 필요한 데이터 병렬 로드 시작...');
      try {
        await Promise.all(loadPromises);
        console.log('✅ 모든 데이터 로드 완료');
        console.log('🔍 로드 후 banks 배열 상태:', banks.length, '개');
      } catch (error) {
        console.error('❌ 데이터 로드 중 일부 실패:', error);
      }
    }
  };

  const handleBankSelectionClose = () => {
    setIsBankSelectionModalVisible(false);
    setSelectedBank(null);
    setAccountProducts([]);
    setIsAccountProductModalVisible(false);
  };

  const handleAccountTypeSelect = (type: '온라인계좌' | '신용카드') => {
    setSelectedAccountType(type);
  };

  const handleBankSelect = async (bank: Bank) => {
    if (selectedAccountType === '온라인계좌') {
      setSelectedBank(bank);
      await loadAccountProducts(bank.bankCode);
      setIsAccountProductModalVisible(true);
    } else {
      // 신용카드 선택의 경우 - 더 이상 사용되지 않음 (FlatList로 직접 카드 선택)
      console.log('신용카드 탭에서는 은행 선택이 아닌 카드 상품 선택을 사용합니다.');
    }
  };

  const handleAccountProductSelect = async (product: AccountProduct) => {
    try {
      setIsLoading(true);
      console.log('🏦 계좌 생성 시작...', {
        userId,
        accountTypeUniqueNo: product.accountTypeUniqueNo,
        productName: product.accountName
      });
      
      const result = await createDemandDepositAccount(userId, {
        accountTypeUniqueNo: product.accountTypeUniqueNo
      });
      
      console.log('✅ 계좌 생성 완료:', result);
      
      Alert.alert('계좌 생성 완료', 
        `${product.bankName} ${product.accountName} 계좌가 생성되었습니다.\n계좌번호: ${result.accountNo}`, [
        { text: '확인', onPress: () => {
          handleBankSelectionClose();
          loadUserAccounts(); // 계좌 목록 새로고침
        }}
      ]);
    } catch (error) {
      console.error('❌ 계좌 생성 실패:', error);
      Alert.alert('알림', '계좌 생성에 실패했습니다.\n잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardDisconnect = (card: UserCard) => {
    Alert.alert(
      '카드 연결 해제',
      `${card.cardName} 카드 연결을 해제하시겠습니까?\n\n해제 후에는 해당 카드의 거래 내역을 더 이상 추적할 수 없습니다.`,
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '해제', 
          style: 'destructive',
          onPress: () => confirmCardDisconnect(card)
        }
      ]
    );
  };

  const confirmCardDisconnect = (card: UserCard) => {
    try {
      // 카드 목록에서 해당 카드 제거
      setUserCards(prev => prev.filter(c => c.userCardId !== card.userCardId));
      
      Alert.alert('완료', `${card.cardName} 카드 연결이 해제되었습니다.`);
      console.log('✅ 카드 연결 해제 완료:', card.cardName);
      
      // 실제 백엔드 API가 있다면 여기서 호출
      // await disconnectUserCard(card.userCardId);
      
    } catch (error) {
      console.error('❌ 카드 연결 해제 실패:', error);
      Alert.alert('오류', '카드 연결 해제 중 오류가 발생했습니다.');
    }
  };

  const handleCardApplication = (card: CardProduct) => {
    // 이미 연결된 카드인지 확인
    const isAlreadyConnected = userCards.some(uc => uc.productId === card.productId);
    if (isAlreadyConnected) {
      Alert.alert('알림', '이미 연결된 카드입니다.');
      return;
    }

    // 선택된 카드 저장하고 계좌 선택 모달 열기
    setSelectedCardForConnection(card);
    setIsBankSelectionModalVisible(false);
    setIsAccountSelectionModalVisible(true);
  };

  const handleAccountSelectionForCard = async (account: UserAccount) => {
    if (!selectedCardForConnection) return;

    try {
      const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식

      setIsLoading(true);
      console.log('💳 카드 연결 시작:', selectedCardForConnection.name);
      console.log('📋 선택된 계좌:', {
        accountId: account.accountId,
        accountNo: account.accountNo,
        bankCode: account.bankCode,
        status: account.status
      });
      console.log('📋 카드 연결 요청 데이터:', {
        productId: selectedCardForConnection.productId,
        withdrawalAccountNo: account.accountNo,
        withdrawalDate: currentDate,
        apiUrl: `/api/finance/user-cards` // userId 쿼리 파라미터 제거
      });
      
      const cardData: ConnectCardRequest = {
        productId: selectedCardForConnection.productId,
        withdrawalAccountNo: account.accountNo,
        withdrawalDate: currentDate
      };
      
      console.log('🌐 API 호출 시작 (올바른 명세서 따름)...');
      const newUserCard = await connectUserCard(cardData);
      console.log('✅ 카드 연결 완료:', newUserCard);
      
      // 사용자 카드 목록 새로고침 (실제 API에서 최신 데이터 가져오기)
      await loadUserCards();
      
      Alert.alert('카드 연결 완료', `${selectedCardForConnection.name} 카드가 성공적으로 연결되었습니다!`);
      setIsAccountSelectionModalVisible(false);
      setSelectedCardForConnection(null);
      
    } catch (error: any) {
      console.error('❌ 카드 연결 실패:', error);
      console.error('❌ 에러 상세:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        method: error.config?.method,
        requestData: error.config?.data
      });
      
      let errorMessage = '카드 연결 중 오류가 발생했습니다.';
      let errorDetails = '';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = '잘못된 요청입니다.';
        errorDetails = '\n• 카드 정보를 확인해주세요\n• 계좌번호가 올바른지 확인해주세요';
      } else if (error.response?.status === 404) {
        errorMessage = '카드 상품을 찾을 수 없습니다.';
        errorDetails = '\n• 선택한 카드가 유효한지 확인해주세요';
      } else if (error.response?.status === 500) {
        errorMessage = '백엔드 서버 오류가 발생했습니다.';
        errorDetails = '\n\n📋 요청 정보:\n• 카드: ' + selectedCardForConnection.name + 
                      '\n• 계좌: ' + account.accountNo + 
                      '\n• 날짜: ' + currentDate +
                      '\n\n⚠️ 백엔드 개발자에게 문의가 필요한 상황입니다.\n' +
                      '현재는 카드 연결 기능이 일시적으로 사용할 수 없습니다.';
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = '네트워크 연결 오류입니다.';
        errorDetails = '\n• 인터넷 연결을 확인해주세요';
      }
      
      Alert.alert('카드 연결 실패', errorMessage + errorDetails, [
        { text: '확인', onPress: () => {
          setIsAccountSelectionModalVisible(false);
          setSelectedCardForConnection(null);
        }}
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // 계좌 메뉴 관련 핸들러들
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

    const bankName = banks.find(b => b.bankCode === selectedAccountForMenu.bankCode)?.bankName || '알 수 없는 은행';
    
    Alert.alert(
      '계좌 연결 해제',
      `${bankName} 계좌를 연결 해제하시겠습니까?\n계좌번호: ${selectedAccountForMenu.accountNo}`,
      [
        {
          text: '취소',
          style: 'cancel'
        },
        {
          text: '연결 해제',
          style: 'destructive',
          onPress: () => {
            // 실제로는 API 호출로 계좌 연결 해제
            console.log('계좌 연결 해제:', selectedAccountForMenu.accountId);
            
            // 로컬 상태에서 해당 계좌 제거
            setUserAccounts(prev => prev.filter(acc => acc.accountId !== selectedAccountForMenu.accountId));
            
            Alert.alert('완료', '계좌 연결이 해제되었습니다.');
            handleAccountMenuClose();
          }
        }
      ]
    );
  };

  // 유틸리티 함수들
  const getBankColor = (bankCode: string): string => {
    const colorMap: { [key: string]: string } = {
      '001': '#DC2626', '002': '#059669', '003': '#2563EB', '004': '#FBBF24',
      '011': '#16A34A', '020': '#0EA5E9', '023': '#10B981', '027': '#DC2626',
      '032': '#7C3AED', '034': '#EC4899', '035': '#F59E0B', '037': '#8B5CF6',
      '039': '#EF4444', '045': '#84CC16', '081': '#10B981', '088': '#3B82F6',
      '090': '#FBBF24', '999': '#6366F1'
    };
    return colorMap[bankCode] || '#6B7280';
  };

  const getBankIcon = (bankCode: string, bankName: string): string => {
    const iconMap: { [key: string]: string } = {
      '001': '🏛️', // 한국은행
      '002': '🏭', // 산업은행
      '003': '🏢', // 기업은행
      '004': '🌟', // 국민은행
      '011': '🌾', // 농협은행
      '020': '🌊', // 우리은행
      '023': '🌐', // SC제일은행
      '027': '🏙️', // 시티은행
      '032': '🏔️', // 대구은행
      '034': '🌸', // 광주은행
      '035': '🏝️', // 제주은행
      '037': '🌿', // 전북은행
      '039': '🏔️', // 경남은행
      '045': '🏘️', // 새마을금고
      '081': '🌺', // KEB하나은행
      '088': '⭐', // 신한은행
      '090': '💛', // 카카오뱅크
      '999': '🎓'  // 싸피은행
    };
    return iconMap[bankCode] || bankName.charAt(0);
  };

  const getCardColor = (index: number): string => {
    const colors = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B'];
    return colors[index % colors.length];
  };

  // 회원탈퇴 관련 핸들러들
  const handleWithdrawCancel = () => {
    setIsWithdrawModalVisible(false);
    setWithdrawInput('');
  };

  const handleWithdrawInputChange = (text: string) => {
    setWithdrawInput(text);
  };

  const handleWithdrawConfirm = () => {
    if (withdrawInput !== '회원탈퇴') {
      Alert.alert('입력 오류', '정확히 "회원탈퇴"를 입력해주세요.');
      return;
    }

    try {
      setIsWithdrawModalVisible(false);
      setWithdrawInput('');
      
      // 회원탈퇴 처리
      console.log('회원탈퇴 처리 시작...');
      
      // 실제 회원탈퇴 로직을 여기에 구현
      // 1. 서버에 탈퇴 요청
      // 2. 로컬 데이터 삭제
      // 3. 로그인 화면으로 이동
      
      setTimeout(() => {
        Alert.alert(
          '회원탈퇴 완료',
          '회원탈퇴가 완료되었습니다.\n앱을 종료합니다.',
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
      console.error('회원탈퇴 중 오류 발생:', error);
      Alert.alert('오류', '회원탈퇴 중 오류가 발생했습니다.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>프로필</Text>
          <TouchableOpacity style={styles.settingsIcon} onPress={handleEditProfile}>
            <Text style={styles.settingsIconText}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Image 
              source={require('../../assets/coco-character.png')} 
              style={styles.avatar}
              resizeMode="contain"
            />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>김환경</Text>
            <Text style={styles.userTitle}>에코 워리어</Text>
            <View style={styles.levelContainer}>
              <Text style={styles.levelText}>레벨 12</Text>
              <Text style={styles.pointsText}>3,500P</Text>
            </View>
          </View>
        </View>

        {/* Connected Accounts Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>연결된 계좌</Text>
            <TouchableOpacity onPress={handleAddAccount}>
              <Text style={styles.addLink}>추가 연결</Text>
            </TouchableOpacity>
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
              <View style={styles.emptyAccountsIcons}>
                <Text style={styles.emptyAccountsIcon}>🏦</Text>
                <Text style={styles.emptyAccountsIcon}>💳</Text>
                <Text style={styles.emptyAccountsIcon}>📊</Text>
              </View>
            </View>
          ) : (
            userAccounts.map((account) => (
              <View key={account.accountId} style={styles.accountCard}>
                <View style={styles.accountInfo}>
                  <View style={[styles.accountIcon, { backgroundColor: getBankColor(account.bankCode) }]}>
                    <Text style={styles.accountIconText}>
                      {getBankIcon(account.bankCode, banks.find(b => b.bankCode === account.bankCode)?.bankName || '알 수 없는 은행')}
                    </Text>
                  </View>
                  <View style={styles.accountDetails}>
                    <Text style={styles.accountName}>
                      {banks.find(b => b.bankCode === account.bankCode)?.bankName || '알 수 없는 은행'}
                    </Text>
                    <Text style={styles.accountNumber}>계좌번호: {account.accountNo}</Text>
                    <Text style={styles.lastSync}>생성일: {new Date(account.createdAt).toLocaleDateString()}</Text>
                  </View>
                </View>
                <View style={styles.connectionStatus}>
                  <View style={styles.statusInfo}>
                    <View style={[
                      styles.statusDot,
                      { backgroundColor: account.status === 'ACTIVE' ? '#10B981' : '#EF4444' }
                    ]} />
                    <Text style={styles.statusText}>
                      {account.status === 'ACTIVE' ? '활성' : '비활성'}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.menuButton}
                    onPress={() => handleAccountMenuPress(account)}
                  >
                    <Text style={styles.menuButtonText}>⋯</Text>
                  </TouchableOpacity>
                </View>
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

        {/* Connected Cards Section */}
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
                <TouchableOpacity 
                  key={card.userCardId} 
                  style={styles.cardItemHorizontal}
                  onLongPress={() => handleCardDisconnect(card)}
                  delayLongPress={800}
                  activeOpacity={0.8}
                >
                  <View style={[styles.cardContainer, { backgroundColor: getCardColor(index) }]}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardIcon}>💳</Text>
                      <Text style={styles.cardTitle}>COCO</Text>
                      <TouchableOpacity 
                        style={styles.cardMenuButton}
                        onPress={() => handleCardDisconnect(card)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Text style={styles.cardMenuText}>⋯</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.cardBody}>
                      <Text style={styles.cardName}>{card.cardName}</Text>
                      <Text style={styles.cardNickname}>{card.cardNickName || '에코 카드'}</Text>
                    </View>
                    <View style={styles.cardFooter}>
                      <View style={styles.cardChip}>
                        <Text style={styles.cardChipText}>ECO</Text>
                      </View>
                      <Text style={styles.cardNumber}>•••• {card.cardUniqueNo.slice(-4).toUpperCase()}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Settings Section */}
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

        {/* Withdraw Section */}
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

      {/* 프로필 수정 모달 */}
      <Modal
        visible={isEditModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>프로필 수정</Text>
            
            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
              {/* 이름 */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>이름</Text>
                <TextInput
                  style={[styles.textInput, styles.disabledInput]}
                  value={profileData.name}
                  editable={false}
                  placeholder="이름을 입력하세요"
                />
              </View>

              {/* 전화번호 */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>전화번호</Text>
                <TextInput
                  style={[styles.textInput, styles.disabledInput]}
                  value={profileData.phone}
                  editable={false}
                  placeholder="전화번호를 입력하세요"
                  keyboardType="phone-pad"
                />
              </View>

              {/* 닉네임 */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>닉네임</Text>
                <View style={styles.nicknameContainer}>
                  <TextInput
                    style={[styles.textInput, styles.nicknameInput]}
                    value={profileData.nickname}
                    onChangeText={(value) => handleInputChange('nickname', value)}
                    placeholder="닉네임을 입력하세요"
                  />
                  <TouchableOpacity style={styles.checkButton} onPress={handleNicknameCheck}>
                    <Text style={styles.checkButtonText}>중복확인</Text>
                  </TouchableOpacity>
                </View>
                {nicknameChecked && (
                  <Text style={[
                    styles.errorText, 
                    nicknameAvailable ? styles.successText : styles.errorText
                  ]}>
                    {nicknameError}
                  </Text>
                )}
              </View>

              {/* 이메일 */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>이메일</Text>
                <View style={styles.emailContainer}>
                  <TextInput
                    style={[styles.textInput, styles.emailInput]}
                    value={profileData.email}
                    onChangeText={(value) => handleInputChange('email', value)}
                    placeholder="이메일을 입력하세요"
                    keyboardType="email-address"
                  />
                  <TouchableOpacity style={styles.verifyButton} onPress={handleEmailVerification}>
                    <Text style={styles.verifyButtonText}>인증</Text>
                  </TouchableOpacity>
                </View>
                {emailVerificationSent && (
                  <Text style={styles.verificationText}>
                    인증코드가 {profileData.email}로 발송되었습니다
                  </Text>
                )}
              </View>

              {/* 인증코드 */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>인증코드</Text>
                <TextInput
                  style={styles.textInput}
                  value={profileData.verificationCode}
                  onChangeText={(value) => handleInputChange('verificationCode', value)}
                  placeholder="인증코드를 입력하세요"
                  keyboardType="number-pad"
                />
              </View>
            </ScrollView>

            {/* 버튼들 */}
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCloseModal}>
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                <Text style={styles.saveButtonText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 로그아웃 확인 모달 */}
      <Modal
        visible={isLogoutModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleLogoutCancel}
      >
        <View style={styles.logoutModalOverlay}>
          <View style={styles.logoutModalContainer}>
            {/* 로그아웃 아이콘 */}
            <View style={styles.logoutIconContainer}>
              <Text style={styles.logoutIcon}>🚪</Text>
            </View>
            
            {/* 제목 */}
            <Text style={styles.logoutTitle}>로그아웃</Text>
            
            {/* 확인 메시지 */}
            <Text style={styles.logoutMessage}>정말로 로그아웃 하시겠습니까?</Text>
            
            {/* 버튼들 */}
            <View style={styles.logoutButtons}>
              <TouchableOpacity style={styles.logoutCancelButton} onPress={handleLogoutCancel}>
                <Text style={styles.logoutCancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.logoutConfirmButton} onPress={handleLogoutConfirm}>
                <Text style={styles.logoutConfirmButtonText}>로그아웃</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>


      {/* 회원탈퇴 확인 모달 */}
      <Modal
        visible={isWithdrawModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleWithdrawCancel}
      >
        <View style={styles.withdrawModalOverlay}>
          <View style={styles.withdrawModalContainer}>
            {/* 회원탈퇴 아이콘 */}
            <View style={styles.withdrawIconContainer}>
              <Text style={styles.withdrawIcon}>🗑️</Text>
            </View>
            
            {/* 제목 */}
            <Text style={styles.withdrawTitle}>정말 탈퇴하시겠어요?</Text>
            
            {/* 경고 메시지 */}
            <Text style={styles.withdrawWarningMessage}>
              탈퇴하시면 지금까지의 모든 활동 기록이 삭제되고 복구할 수 없습니다.
            </Text>
            
            {/* 입력 확인 섹션 */}
            <View style={styles.withdrawInputSection}>
              <Text style={styles.withdrawInputInstruction}>
                정말 탈퇴하시려면 아래에 '회원탈퇴'를 입력해주세요.
              </Text>
              <TextInput
                style={styles.withdrawTextInput}
                value={withdrawInput}
                onChangeText={handleWithdrawInputChange}
                placeholder="회원탈퇴"
                placeholderTextColor="#999"
              />
            </View>
            
            {/* 버튼들 */}
            <View style={styles.withdrawButtons}>
              <TouchableOpacity style={styles.withdrawCancelButton} onPress={handleWithdrawCancel}>
                <Text style={styles.withdrawCancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.withdrawConfirmButton} onPress={handleWithdrawConfirm}>
                <Text style={styles.withdrawConfirmButtonText}>탈퇴하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 은행 선택 모달 */}
      <Modal
        visible={isBankSelectionModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleBankSelectionClose}
      >
        <View style={styles.bankModalOverlay}>
          <View style={styles.bankModalContainer}>
            {/* 헤더 */}
            <View style={styles.bankModalHeader}>
              <Text style={styles.bankModalTitle}>
                계좌 카드 연결 {selectedAccountType === '온라인계좌' && banks.length > 0 && `(${banks.length}개 은행)`}
              </Text>
              <TouchableOpacity onPress={handleBankSelectionClose}>
                <Text style={styles.bankModalCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* 계좌 타입 선택 */}
            <View style={styles.accountTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.accountTypeButton,
                  selectedAccountType === '온라인계좌' && styles.accountTypeButtonActive
                ]}
                onPress={() => handleAccountTypeSelect('온라인계좌')}
              >
                <Text style={[
                  styles.accountTypeText,
                  selectedAccountType === '온라인계좌' && styles.accountTypeTextActive
                ]}>
                  온라인계좌
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.accountTypeButton,
                  selectedAccountType === '신용카드' && styles.accountTypeButtonActive
                ]}
                onPress={() => handleAccountTypeSelect('신용카드')}
              >
                <Text style={[
                  styles.accountTypeText,
                  selectedAccountType === '신용카드' && styles.accountTypeTextActive
                ]}>
                  신용카드
                </Text>
              </TouchableOpacity>
            </View>

            {/* 로딩 표시 */}
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366F1" />
                <Text style={styles.loadingText}>데이터를 불러오는 중...</Text>
              </View>
            )}

            {/* 은행/카드 목록 */}
            {!isLoading && (
              <View style={styles.bankListContainer}>
                {selectedAccountType === '온라인계좌' ? (
                  // 온라인계좌 선택 시 실제 은행 목록 표시 (FlatList 사용)
                  <FlatList
                    key="banks-2-columns" // 고유 key로 컴포넌트 구분
                    data={banks}
                    numColumns={2}
                    keyExtractor={(item) => item.bankCode}
                    showsVerticalScrollIndicator={true}
                    contentContainerStyle={styles.bankListContent}
                    columnWrapperStyle={styles.bankRow}
                    nestedScrollEnabled={true}
                    scrollEnabled={true}
                    bounces={true}
                    alwaysBounceVertical={true}
                    renderItem={({ item: bank, index }) => (
                      <TouchableOpacity
                        style={styles.bankItem}
                        onPress={() => handleBankSelect(bank)}
                      >
                        <View style={[styles.bankLogoContainer, { backgroundColor: getBankColor(bank.bankCode) }]}>
                          <Text style={styles.bankIconText}>{getBankIcon(bank.bankCode, bank.bankName)}</Text>
                        </View>
                        <Text style={styles.bankName}>{bank.bankName}</Text>
                      </TouchableOpacity>
                    )}
                  />
                ) : (
                  // 신용카드 선택 시 실제 카드 상품 목록 표시 (세로 1열로 정렬)
                  cardProducts.length > 0 ? (
                    <FlatList
                      key="cards-1-column" // 고유 key로 컴포넌트 구분
                      data={cardProducts}
                      numColumns={1}
                      keyExtractor={(item) => item.cardUniqueNo}
                      showsVerticalScrollIndicator={true}
                      contentContainerStyle={styles.cardListContent}
                      nestedScrollEnabled={true}
                      scrollEnabled={true}
                      bounces={true}
                      alwaysBounceVertical={true}
                      renderItem={({ item: card, index }) => (
                      <TouchableOpacity
                        style={styles.cardItemModal}
                        onPress={() => handleCardApplication(card)}
                      >
                        <View style={[styles.cardContainer, { backgroundColor: getCardColor(index) }]}>
                          <View style={styles.cardHeader}>
                            <Text style={styles.cardIcon}>💳</Text>
                            <Text style={styles.cardTitle}>COCO</Text>
                          </View>
                          <View style={styles.cardBody}>
                            <Text style={styles.cardName}>{card.name}</Text>
                            <Text style={styles.cardDescription}>{card.description}</Text>
                          </View>
                          <View style={styles.cardFooter}>
                            <View style={styles.cardChip}>
                              <Text style={styles.cardChipText}>ECO</Text>
                            </View>
                            <Text style={styles.cardNumber}>•••• {card.cardUniqueNo.slice(-4).toUpperCase()}</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    )}
                  />
                  ) : (
                    <View style={styles.emptyCardContainer}>
                      <Text style={styles.emptyCardText}>카드 상품을 불러오는 중...</Text>
                      <ActivityIndicator size="small" color="#6366F1" />
                    </View>
                  )
                )}
              </View>
            )}

            {/* 하단 정보 */}
            <View style={styles.bankModalInfo}>
              <Text style={styles.bankModalInfoIcon}>ⓘ</Text>
              <Text style={styles.bankModalInfoText}>
                금융결제원을 통해 안전하게 연결합니다. 계좌정보는 비밀번호와 함께 암호화되어 저장됩니다.
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* 계좌 상품 선택 모달 */}
      <Modal
        visible={isAccountProductModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsAccountProductModalVisible(false)}
      >
        <View style={styles.bankModalOverlay}>
          <View style={styles.bankModalContainer}>
            {/* 헤더 */}
            <View style={styles.bankModalHeader}>
              <Text style={styles.bankModalTitle}>
                {selectedBank?.bankName} 계좌 상품 선택
              </Text>
              <TouchableOpacity onPress={() => setIsAccountProductModalVisible(false)}>
                <Text style={styles.bankModalCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* 로딩 표시 */}
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366F1" />
                <Text style={styles.loadingText}>상품 목록을 불러오는 중...</Text>
              </View>
            )}

            {/* 계좌 상품 목록 */}
            {!isLoading && (
              <ScrollView style={styles.accountProductList}>
                {accountProducts.map((product, index) => (
                  <TouchableOpacity
                    key={product.accountTypeUniqueNo}
                    style={[
                      styles.accountProductItem,
                      index === accountProducts.length - 1 && { borderBottomWidth: 0 }
                    ]}
                    onPress={() => handleAccountProductSelect(product)}
                  >
                    <View style={styles.accountProductInfo}>
                      <Text style={styles.accountProductName}>{product.accountName}</Text>
                      <Text style={styles.accountProductDescription}>{product.accountDescription}</Text>
                      <Text style={styles.accountProductType}>{product.accountTypeName}</Text>
                    </View>
                    <Text style={styles.bankArrow}>›</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* 하단 정보 */}
            <View style={styles.bankModalInfo}>
              <Text style={styles.bankModalInfoIcon}>ⓘ</Text>
              <Text style={styles.bankModalInfoText}>
                상품을 선택하면 해당 계좌가 자동으로 생성됩니다.
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* 계좌 메뉴 모달 */}
      <Modal
        visible={isAccountMenuModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleAccountMenuClose}
      >
        <View style={styles.accountMenuModalOverlay}>
          <View style={styles.accountMenuModalContainer}>
            {selectedAccountForMenu && (
              <>
                <View style={styles.accountMenuHeader}>
                  <Text style={styles.accountMenuTitle}>
                    {banks.find(b => b.bankCode === selectedAccountForMenu.bankCode)?.bankName || '알 수 없는 은행'}
                  </Text>
                  <Text style={styles.accountMenuSubtitle}>
                    {selectedAccountForMenu.accountNo}
                  </Text>
                </View>

                <View style={styles.accountMenuOptions}>
                  <TouchableOpacity
                    style={styles.accountMenuOption}
                    onPress={handleAccountDisconnect}
                  >
                    <Text style={styles.accountMenuOptionIcon}>🔗</Text>
                    <Text style={styles.accountMenuOptionText}>계좌 연결 해제</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.accountMenuCancelButton}
                  onPress={handleAccountMenuClose}
                >
                  <Text style={styles.accountMenuCancelText}>취소</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* 카드 연결용 계좌 선택 모달 - 새로운 컴포넌트 사용 */}
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
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  settingsIcon: {
    padding: 8,
  },
  settingsIconText: {
    fontSize: 20,
  },
  profileCard: {
    flexDirection: 'row',
    backgroundColor: '#2c2c2c',
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#555',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatar: {
    width: 50,
    height: 50,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userTitle: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 8,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelText: {
    fontSize: 14,
    color: '#fff',
    marginRight: 12,
  },
  pointsText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  addLink: {
    fontSize: 14,
    color: '#007AFF',
  },
  accountCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  accountIconText: {
    fontSize: 20,
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 2,
  },
  accountNumber: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  
  // 빈 계좌 컨테이너 스타일
  emptyAccountsContainer: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 16,
  },
  emptyAccountsText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  emptyAccountsIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  emptyAccountsIcon: {
    fontSize: 24,
  },
  lastSync: {
    fontSize: 12,
    color: '#666',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  menuButton: {
    padding: 8,
    marginLeft: 8,
  },
  menuButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  addAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  addAccountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addAccountIconText: {
    fontSize: 20,
    color: '#666',
  },
  addAccountText: {
    fontSize: 16,
    color: '#666',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  logoutItem: {
    marginTop: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
    color: '#FF3B30',
  },
  settingArrow: {
    fontSize: 20,
    color: '#c0c0c0',
  },
  // 회원탈퇴 섹션 스타일
  withdrawSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  withdrawItem: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  withdrawText: {
    fontSize: 14,
    color: '#666',
    textDecorationLine: 'underline',
  },
  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    flex: 1,
  },
  modalScrollView: {
    flex: 1,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#999',
    borderColor: '#e0e0e0',
  },
  nicknameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nicknameInput: {
    flex: 1,
    marginRight: 8,
  },
  checkButton: {
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  checkButtonText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
  successText: {
    color: '#4CAF50',
    fontSize: 12,
    marginTop: 4,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emailInput: {
    flex: 1,
    marginRight: 8,
  },
  verifyButton: {
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  verifyButtonText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
  },
  verificationText: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    marginLeft: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  // 로그아웃 모달 스타일
  logoutModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoutModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  logoutIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoutIcon: {
    fontSize: 24,
  },
  logoutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  logoutMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  logoutButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  logoutCancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutCancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  logoutConfirmButton: {
    flex: 1,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutConfirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  // 회원탈퇴 모달 스타일
  withdrawModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  withdrawModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  withdrawIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  withdrawIcon: {
    fontSize: 24,
  },
  withdrawTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  withdrawWarningMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  withdrawInputSection: {
    backgroundColor: '#FFE5E5',
    borderRadius: 8,
    padding: 16,
    width: '100%',
    marginBottom: 24,
  },
  withdrawInputInstruction: {
    fontSize: 14,
    color: '#FF3B30',
    marginBottom: 12,
    textAlign: 'center',
  },
  withdrawTextInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    textAlign: 'center',
  },
  withdrawButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  withdrawCancelButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  withdrawCancelButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '500',
  },
  withdrawConfirmButton: {
    flex: 1,
    backgroundColor: '#8B4513',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  withdrawConfirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  // 은행 선택 모달 스타일
  bankModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bankModalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
    maxHeight: '90%', // 80%에서 90%로 증가
    minHeight: '70%', // 최소 높이 추가
  },
  bankModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  bankModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  bankModalCloseButton: {
    fontSize: 18,
    color: '#666',
    padding: 4,
  },
  accountTypeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  accountTypeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  accountTypeButtonActive: {
    backgroundColor: '#6366F1',
  },
  accountTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  accountTypeTextActive: {
    color: '#fff',
  },
  bankListContainer: {
    flex: 1, // 남은 공간을 모두 사용
    paddingHorizontal: 0,
  },
  bankListContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 40, // 하단 패딩 추가로 마지막 항목들이 잘리지 않도록
  },
  
  // 카드 목록 스타일 (세로 1열)
  cardListContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 40,
    gap: 12, // 카드 간 간격
  },
  
  // 빈 카드 컨테이너 스타일
  emptyCardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyCardText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 12,
  },

  // 계좌 선택 모달 스타일
  selectedCardInfo: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  selectedCardTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  selectedCardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedCardIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  selectedCardDetails: {
    flex: 1,
  },
  selectedCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  selectedCardDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  accountSelectionContainer: {
    flex: 1,
  },
  accountSelectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  accountSelectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  debugText: {
    fontSize: 12,
    color: '#EF4444',
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
    textAlign: 'center',
  },
  accountListWrapper: {
    flex: 1,
    minHeight: 500, // 최소 높이 크게 설정
    maxHeight: 600, // 최대 높이도 증가
  },
  accountCountInfo: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  accountSelectionList: {
    flex: 1,
    minHeight: 450, // ScrollView 최소 높이 설정
    maxHeight: 550, // ScrollView 최대 높이 증가
  },
  accountStatusBadge: {
    backgroundColor: '#10B981',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  accountStatusText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  noAccountContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  noAccountIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noAccountTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  noAccountText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  createAccountButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  createAccountButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  accountSelectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20, // 패딩 증가
    marginBottom: 16, // 간격 증가
    marginHorizontal: 8, // 좌우 여백 추가
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 80, // 최소 높이 설정
  },
  accountSelectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accountSelectionArrow: {
    fontSize: 18,
    color: '#9CA3AF',
    fontWeight: 'bold',
  },
  
  bankRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    marginBottom: 12, // 16에서 12로 줄여서 더 촘촘하게
  },
  bankItem: {
    width: '45%',
    aspectRatio: 1.3, // 세로를 조금 더 길게 해서 더 많이 보이도록
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12, // 패딩을 줄여서 공간 절약
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  bankItemLeft: {
    marginRight: '2.5%',
  },
  bankItemRight: {
    marginLeft: '2.5%',
  },
  bankIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  bankIconText: {
    fontSize: 24,
    color: '#fff',
  },
  bankLogoContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  bankLogoImage: {
    width: 48,
    height: 48,
  },
  bankName: {
    fontSize: 12, // 14에서 12로 줄여서 공간 절약
    fontWeight: '500',
    color: '#000',
    textAlign: 'center',
    marginTop: 4, // 아이콘과의 간격 추가
  },
  bankModalInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F3F4F6',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  bankModalInfoIcon: {
    fontSize: 16,
    color: '#6366F1',
    marginRight: 8,
    marginTop: 2,
  },
  bankModalInfoText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    flex: 1,
  },
  // 로딩 스타일
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  
  // 계좌 상품 목록 스타일
  accountProductList: {
    maxHeight: 400,
    paddingHorizontal: 0,
  },
  accountProductItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  accountProductInfo: {
    flex: 1,
  },
  accountProductName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  accountProductDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  accountProductType: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  
  // 화살표 스타일
  bankArrow: {
    fontSize: 18,
    color: '#9CA3AF',
    fontWeight: '300',
  },

  cardCount: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },

  cardNickname: {
    fontSize: 12,
    color: '#E5E7EB',
    fontWeight: '300',
    marginTop: 2,
  },

  // 카드 섹션 스타일
  cardsSection: {
    paddingBottom: 24, // 카드 섹션 하단 패딩 추가
  },

  // 카드 세로 정렬 스타일
  cardsVerticalContainer: {
    marginTop: 12,
    gap: 16, // 카드 간 간격
  },
  cardItemVertical: {
    width: '100%',
    height: 175,
  },

  // 기존 수평 스크롤 스타일 (사용하지 않음)
  cardsScrollView: {
    marginTop: 12,
    height: 200,
    overflow: 'visible',
  },
  cardsScrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  cardItemHorizontal: {
    width: 280,
    height: 175,
    marginRight: 16,
  },

  // 코코 카드 스타일 (연결된 카드 표시용)
  cardItem: {
    width: '100%',
    aspectRatio: 1.6,
    marginBottom: 16,
  },
  
  // 모달용 카드 아이템 스타일 (세로 1열)
  cardItemModal: {
    width: '100%',
    height: 175,
    marginBottom: 12,
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
  cardMenuButton: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardMenuText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    minWidth: 20,
  },
  cardIcon: {
    fontSize: 24,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1.5,
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

  // 계좌 메뉴 모달 스타일
  accountMenuModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  accountMenuModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  accountMenuHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  accountMenuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  accountMenuSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  accountMenuOptions: {
    width: '100%',
    marginBottom: 16,
  },
  accountMenuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 8,
  },
  accountMenuOptionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  accountMenuOptionText: {
    fontSize: 16,
    color: '#DC2626',
    fontWeight: '500',
  },
  accountMenuCancelButton: {
    width: '100%',
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  accountMenuCancelText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});

export default ProfileScreen;