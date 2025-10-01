import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import type { UserAccount, Bank } from '../../types/finance';
import { getBankColor } from '../../utils/bankUtils';

interface AccountCardProps {
  account: UserAccount;
  bank?: Bank;
  onDelete: (account: UserAccount) => void;
}

const AccountCard: React.FC<AccountCardProps> = ({
  account,
  bank,
  onDelete,
}) => {
  const bankColor = getBankColor(account.bankCode);

  return (
    <View style={[styles.cardContainer, { backgroundColor: bankColor }]}>
      {/* 배경 그라데이션 효과 */}
      <View style={styles.gradientOverlay} />
      
      {/* 카드 헤더 */}
      <View style={styles.cardHeader}>
        <View style={styles.bankInfo}>
          <View style={styles.bankIcon}>
            <Text style={styles.bankIconText}>
              {bank?.bankName?.charAt(0) || account.bankCode}
            </Text>
          </View>
          <View style={styles.bankDetails}>
            <Text style={styles.bankName}>{bank?.bankName || `은행 ${account.bankCode}`}</Text>
            <Text style={styles.accountType}>수시입출금</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => onDelete(account)}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <Text style={styles.deleteButtonText}>⋯</Text>
        </TouchableOpacity>
      </View>

      {/* 계좌 정보 */}
      <View style={styles.cardBody}>
        <Text style={styles.accountNumber}>{account.accountNo}</Text>
        <View style={styles.accountInfo}>
          <Text style={styles.currency}>{account.currencyName}</Text>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: account.status === 'ACTIVE' ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)' }
          ]}>
            <Text style={styles.statusText}>
              {account.status === 'ACTIVE' ? '활성' : '비활성'}
            </Text>
          </View>
        </View>
      </View>

      {/* 카드 푸터 */}
      <View style={styles.cardFooter}>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.cardTitle}>COCO</Text>
          <View style={styles.cardTitleUnderline} />
        </View>
        <Text style={styles.cardSubtitle}>에코 계좌</Text>
      </View>

      {/* 장식 요소 */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: 300,
    height: 190,
    borderRadius: 24,
    padding: 24,
    marginRight: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    zIndex: 2,
  },
  bankInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bankIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  bankIconText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  bankDetails: {
    flex: 1,
  },
  bankName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  accountType: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  deleteButton: {
    padding: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  deleteButtonText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    minWidth: 28,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardBody: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: 24,
    zIndex: 2,
  },
  accountNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: 3,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  accountInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currency: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  statusText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 3,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  cardTitleUnderline: {
    width: 30,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.8)',
    marginLeft: 8,
    borderRadius: 2,
  },
  cardSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    zIndex: 1,
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.08)',
    zIndex: 1,
  },
});

export default AccountCard;
