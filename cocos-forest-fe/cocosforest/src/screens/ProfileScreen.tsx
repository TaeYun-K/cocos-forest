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
  BackHandler
} from 'react-native';

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

  const connectedAccounts = [
    {
      id: 1,
      bankName: 'KB국민은행',
      lastSync: '2분 전',
      isConnected: true,
      icon: '🏦'
    },
    {
      id: 2,
      bankName: '신한카드',
      lastSync: '2분 전',
      isConnected: true,
      icon: '💳'
    }
  ];

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
            <TouchableOpacity>
              <Text style={styles.addLink}>추가 연결</Text>
            </TouchableOpacity>
          </View>
          
          {connectedAccounts.map((account) => (
            <View key={account.id} style={styles.accountCard}>
              <View style={styles.accountInfo}>
                <View style={styles.accountIcon}>
                  <Text style={styles.accountIconText}>{account.icon}</Text>
                </View>
                <View style={styles.accountDetails}>
                  <Text style={styles.accountName}>{account.bankName}</Text>
                  <Text style={styles.lastSync}>마지막 동기화: {account.lastSync}</Text>
                </View>
              </View>
              <View style={styles.connectionStatus}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>연결됨</Text>
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.addAccountButton}>
            <View style={styles.addAccountIcon}>
              <Text style={styles.addAccountIconText}>+</Text>
            </View>
            <Text style={styles.addAccountText}>추가 계좌 연결</Text>
          </TouchableOpacity>
        </View>

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
  lastSync: {
    fontSize: 12,
    color: '#666',
  },
  connectionStatus: {
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
});

export default ProfileScreen;