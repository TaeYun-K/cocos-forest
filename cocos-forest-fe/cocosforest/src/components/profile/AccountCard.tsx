import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import type { UserAccount } from '../../api/finance';
import type { Bank } from '../../api/finance';

interface AccountCardProps {
  account: UserAccount;
  banks: Bank[];
  onMenuPress: (account: UserAccount) => void;
  getBankColor: (bankCode: string) => string;
  getBankIcon: (bankCode: string, bankName: string) => any;
}

const AccountCard: React.FC<AccountCardProps> = ({
  account,
  banks,
  onMenuPress,
  getBankColor,
  getBankIcon,
}) => {
  const bankName = banks.find(b => b.bankCode === account.bankCode)?.bankName || '알 수 없는 은행';

  return (
    <View style={styles.accountCard}>
      <View style={styles.accountInfo}>
        <View style={[styles.accountIcon, { backgroundColor: getBankColor(account.bankCode) }]}>
          {getBankIcon(account.bankCode, bankName) ? (
            <Image 
              source={getBankIcon(account.bankCode, bankName)} 
              style={styles.bankLogoImage}
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.accountIconText}>
              {bankName.charAt(0)}
            </Text>
          )}
        </View>
        <View style={styles.accountDetails}>
          <Text style={styles.accountName}>{bankName}</Text>
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
          onPress={() => onMenuPress(account)}
        >
          <Text style={styles.menuButtonText}>⋯</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  bankLogoImage: {
    width: 24,
    height: 24,
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
});

export default AccountCard;

