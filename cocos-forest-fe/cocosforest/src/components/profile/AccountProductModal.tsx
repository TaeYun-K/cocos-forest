import * as React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import type { Bank, AccountProduct } from '../../api/finance';

interface AccountProductModalProps {
  visible: boolean;
  onClose: () => void;
  selectedBank: Bank | null;
  accountProducts: AccountProduct[];
  onProductSelect: (product: AccountProduct) => void;
  isLoading: boolean;
}

const AccountProductModal: React.FC<AccountProductModalProps> = ({
  visible,
  onClose,
  selectedBank,
  accountProducts,
  onProductSelect,
  isLoading,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.bankModalOverlay}>
        <View style={styles.bankModalContainer}>
          {/* 헤더 */}
          <View style={styles.bankModalHeader}>
            <Text style={styles.bankModalTitle}>
              {selectedBank?.bankName} 계좌 상품 선택
            </Text>
            <TouchableOpacity onPress={onClose}>
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
                  onPress={() => onProductSelect(product)}
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
  );
};

const styles = StyleSheet.create({
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
    maxHeight: '90%',
    minHeight: '70%',
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
  bankArrow: {
    fontSize: 18,
    color: '#9CA3AF',
    fontWeight: '300',
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
});

export default AccountProductModal;

