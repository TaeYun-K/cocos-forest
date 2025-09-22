import { StyleSheet } from 'react-native';
import { colors } from './dashboardStyles';

export const paymentSuccessModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    margin: 20,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: colors.gray600,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  confirmButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  },
});