import { StyleSheet } from 'react-native';
import { colors } from './dashboardStyles';

export const paymentButtonStyles = StyleSheet.create({
  paymentButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  paymentButtonDisabled: {
    backgroundColor: colors.gray300,
    shadowOpacity: 0,
    elevation: 0,
  },
  paymentButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  },
});