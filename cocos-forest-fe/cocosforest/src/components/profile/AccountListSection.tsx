import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator
} from 'react-native';
import type { Bank, UserAccount } from '../../api/finance';
import { getBankIcon } from '../../utils/bankUtils';

interface AccountListSectionProps {
  userAccounts: UserAccount[];
  banks: Bank[];
  isLoading: boolean;
  onAccountMenuPress: (account: UserAccount) => void;
  onAddAccount: () => void;
}

const AccountListSection: React.FC<AccountListSectionProps> = ({
  userAccounts,
  banks,
  isLoading,
  onAccountMenuPress,
  onAddAccount
}) => {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>연결된 계좌</Text>
      </View>

      {isLoading && userAccounts.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#15803d" />
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
            const bankLogo = getBankIcon(account.bankCode, bankName);

            return (
              <View key={account.accountId} style={styles.accountCard}>
                <View style={styles.accountCardHeader}>
                  <View style={styles.bankInfo}>
                    {bankLogo && (
                      <Image
                        source={bankLogo}
                        style={styles.bankLogo}
                        resizeMode="contain"
                      />
                    )}
                    <Text style={styles.accountCardTitle}>{bankName}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => onAccountMenuPress(account)}
                  >
                    <Text style={styles.menuButtonText}>⋯</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.accountCardText}>계좌: {account.accountNo}</Text>
              </View>
            );
          })}
        </View>
      )}

      <TouchableOpacity style={styles.addAccountButton} onPress={onAddAccount}>
        <View style={styles.addAccountIcon}>
          <Text style={styles.addAccountIconText}>+</Text>
        </View>
        <Text style={styles.addAccountText}>계좌/카드 등록하기</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
  accountCard: {
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
    borderLeftColor: '#15803d',
  },
  accountCardHeader: {
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
  accountCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  accountCardText: {
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
    backgroundColor: '#15803d',
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
    color: '#15803d',
    fontWeight: '600',
  },
});

export default AccountListSection;