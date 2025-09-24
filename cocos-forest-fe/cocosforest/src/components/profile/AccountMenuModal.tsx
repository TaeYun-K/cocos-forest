import * as React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { Bank, UserAccount } from '../../api/finance';

interface AccountMenuModalProps {
  visible: boolean;
  onClose: () => void;
  selectedAccount: UserAccount | null;
  banks: Bank[];
  onDisconnect: () => void;
}

const AccountMenuModal: React.FC<AccountMenuModalProps> = ({
  visible,
  onClose,
  selectedAccount,
  banks,
  onDisconnect
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {selectedAccount && (
            <>
              <View style={styles.header}>
                <Text style={styles.title}>
                  {banks.find(b => b.bankCode === selectedAccount.bankCode)?.bankName || '알 수 없는 은행'}
                </Text>
                <Text style={styles.subtitle}>
                  {selectedAccount.accountNo}
                </Text>
              </View>

              <View style={styles.options}>
                <TouchableOpacity
                  style={styles.option}
                  onPress={onDisconnect}
                >
                  <Text style={styles.optionIcon}>🔗</Text>
                  <Text style={styles.optionText}>계좌 연결 해제</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
              >
                <Text style={styles.cancelText}>취소</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  options: {
    paddingVertical: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F8F9FF',
  },
  optionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
});

export default AccountMenuModal;
