import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/commonStyles';

interface AllAgreementToggleProps {
  isAllAgreed: boolean;
  onToggle: () => void;
}

export const AllAgreementToggle: React.FC<AllAgreementToggleProps> = ({
  isAllAgreed,
  onToggle,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        isAllAgreed && styles.containerActive
      ]}
      onPress={onToggle}
    >
      <View style={styles.checkboxContainer}>
        <View style={[
          styles.checkbox,
          isAllAgreed && styles.checkboxChecked
        ]}>
          {isAllAgreed && (
            <Ionicons name="checkmark" size={20} color="#FFFFFF" />
          )}
        </View>
        <Text style={[
          styles.text,
          isAllAgreed && styles.textActive
        ]}>
          전체 동의
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  containerActive: {
    backgroundColor: colors.greenLight,
    borderColor: colors.primary,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DEE2E6',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
  },
  textActive: {
    color: colors.primary,
  },
});