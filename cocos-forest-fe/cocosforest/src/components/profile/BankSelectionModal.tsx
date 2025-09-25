import * as React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
} from 'react-native';
import type { Bank, CardProduct } from '../../api/finance';
import { getBankIcon } from '../../utils/bankUtils';

interface BankSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  banks: Bank[];
  cardProducts: CardProduct[];
  selectedAccountType: '온라인계좌' | '신용카드';
  onAccountTypeSelect: (type: '온라인계좌' | '신용카드') => void;
  onBankSelect: (bank: Bank) => void;
  onCardApplication: (card: CardProduct) => void;
  isLoading: boolean;
  getBankColor: (bankCode: string) => string;
  getCardColor: (index: number) => string;
}

const BankSelectionModal: React.FC<BankSelectionModalProps> = ({
  visible,
  onClose,
  banks,
  cardProducts,
  selectedAccountType,
  onAccountTypeSelect,
  onBankSelect,
  onCardApplication,
  isLoading,
  getBankColor,
  getCardColor,
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
              계좌 카드 연결 {selectedAccountType === '온라인계좌' && banks.length > 0 && `(${banks.length}개 은행)`}
            </Text>
            <TouchableOpacity onPress={onClose}>
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
              onPress={() => onAccountTypeSelect('온라인계좌')}
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
              onPress={() => onAccountTypeSelect('신용카드')}
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
              <ActivityIndicator size="large" color="#15803d" />
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
                      onPress={() => onBankSelect(bank)}
                    >
                      <View style={styles.bankLogoContainer}>
                        {getBankIcon(bank.bankCode, bank.bankName) ? (
                          <Image
                            source={getBankIcon(bank.bankCode, bank.bankName)}
                            style={styles.bankLogoImage}
                            resizeMode="contain"
                          />
                        ) : (
                          <Text style={styles.bankIconText}>{bank.bankName.charAt(0)}</Text>
                        )}
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
                        onPress={() => onCardApplication(card)}
                      >
                        <View style={[styles.cardContainer, { backgroundColor: getCardColor(index) }]}>
                          <View style={styles.cardHeader}>
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
                    <ActivityIndicator size="small" color="#15803d" />
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
    backgroundColor: '#15803d',
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
    flex: 1,
    paddingHorizontal: 0,
  },
  bankListContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 40,
  },
  cardListContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 40,
    gap: 12,
  },
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
  bankRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    marginBottom: 12,
  },
  bankItem: {
    width: '45%',
    aspectRatio: 1.3,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
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
    width: 42,
    height: 42,
  },
  bankIconText: {
    fontSize: 24,
    color: '#fff',
  },
  bankName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000',
    textAlign: 'center',
    marginTop: 4,
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
    color: '#15803d',
    marginRight: 8,
    marginTop: 2,
  },
  bankModalInfoText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    flex: 1,
  },
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
});

export default BankSelectionModal;

