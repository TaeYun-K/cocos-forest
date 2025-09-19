import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { paymentSuccessModalStyles as styles } from '../../styles/dashboard';

interface PaymentSuccessModalProps {
  visible: boolean;
  onConfirm: () => void;
}

export const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
  visible,
  onConfirm
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>결제 완료</Text>
          <Text style={styles.message}>
            새로운 결제가 추가되었습니다.{'\n'}
            탄소배출내역을 다시 확인해보세요!
          </Text>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={onConfirm}
          >
            <Text style={styles.confirmButtonText}>확인</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};