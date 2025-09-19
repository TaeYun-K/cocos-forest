import React, { useState } from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { addNewPayment } from '../../api/dashboard';
import { paymentButtonStyles as styles } from '../../styles/dashboard';

interface PaymentButtonProps {
  onPaymentSuccess: () => void;
  disabled?: boolean;
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({
  onPaymentSuccess,
  disabled = false
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    if (isLoading || disabled) return;

    try {
      setIsLoading(true);

      // userId: 8, userCardId: 2로 고정
      await addNewPayment(8, 2);

      // 결제 성공 시 콜백 호출
      onPaymentSuccess();
    } catch (error) {
      console.error('결제 처리 중 오류:', error);
      // 에러 처리 (필요시 에러 모달 표시)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.paymentButton,
        (isLoading || disabled) && styles.paymentButtonDisabled
      ]}
      onPress={handlePayment}
      disabled={isLoading || disabled}
    >
      {isLoading ? (
        <ActivityIndicator color="#ffffff" size="small" />
      ) : (
        <Text style={styles.paymentButtonText}>결제하기</Text>
      )}
    </TouchableOpacity>
  );
};