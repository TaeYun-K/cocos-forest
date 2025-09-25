import * as React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { fetchUserAccounts } from '../../api/finance';
import type { Bank, CardProduct, UserAccount } from '../../api/finance';
import { getBankColor, getBankIcon } from '../../utils/bankUtils';

interface AccountSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  selectedCard: CardProduct | null;
  onAccountSelect: (account: UserAccount) => void;
  userId: number;
  banks: Bank[];
}

const AccountSelectionModal: React.FC<AccountSelectionModalProps> = ({
  visible,
  onClose,
  selectedCard,
  onAccountSelect,
  userId,
  banks,
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
      console.log('모달에서 로드한 계좌:', accountsData.length, '개');
      setAccounts(accountsData);
    } catch (error) {
      console.error('❌ 계좌 로드 실패:', error);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
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
                <ActivityIndicator size="large" color="#15803d" />
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
                        <View style={styles.accountIcon}>
                          {getBankIcon(account.bankCode, banks.find(b => b.bankCode === account.bankCode)?.bankName || '') ? (
                            <Image
                              source={getBankIcon(account.bankCode, banks.find(b => b.bankCode === account.bankCode)?.bankName || '')}
                              style={styles.bankLogoImage}
                              resizeMode="contain"
                            />
                          ) : (
                            <Text style={styles.accountIconText}>
                              {banks.find(b => b.bankCode === account.bankCode)?.bankName?.charAt(0) || '?'}
                            </Text>
                          )}
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

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  bankModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 20,
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
  debugText: {
    fontSize: 12,
    color: '#EF4444',
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
    textAlign: 'center',
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
  accountListWrapper: {
    flex: 1,
    minHeight: 500,
    maxHeight: 600,
  },
  accountCountInfo: {
    fontSize: 16,
    color: '#15803d',
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  accountSelectionList: {
    flex: 1,
    minHeight: 450,
    maxHeight: 550,
  },
  accountSelectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 80,
  },
  accountSelectionInfo: {
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
  bankLogoImage: {
    width: 36,
    height: 36,
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
  accountCurrency: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
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
  accountSelectionArrow: {
    fontSize: 18,
    color: '#9CA3AF',
    fontWeight: 'bold',
  },
  noAccountContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
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
});

export default AccountSelectionModal;

