import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface IndividualAgreementItemProps {
  isChecked: boolean;
  onToggle: () => void;
  title: string;
  isRequired: boolean;
  onViewDetails?: () => void;
}

export const IndividualAgreementItem: React.FC<IndividualAgreementItemProps> = ({
  isChecked,
  onToggle,
  title,
  isRequired,
  onViewDetails,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onToggle}
    >
      <View style={styles.checkboxContainer}>
        <View style={[styles.checkbox, isChecked && styles.checkedCheckbox]}>
          {isChecked && (
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          )}
        </View>
        <Text style={styles.text}>
          {title} <Text style={isRequired ? styles.required : styles.optional}>
            ({isRequired ? '필수' : '선택'})
          </Text>
        </Text>
      </View>
      {onViewDetails && (
        <TouchableOpacity style={styles.viewButton} onPress={onViewDetails}>
          <Text style={styles.viewButtonText}>보기</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  checkboxContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#DEE2E6',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkedCheckbox: {
    backgroundColor: '#7CB342',
    borderColor: '#7CB342',
  },
  text: {
    fontSize: 14,
    color: '#333333',
    flex: 1,
  },
  required: {
    color: '#FF5722',
    fontWeight: '500',
  },
  optional: {
    color: '#7CB342',
    fontWeight: '500',
  },
  viewButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#7CB342',
  },
  viewButtonText: {
    fontSize: 12,
    color: '#7CB342',
    fontWeight: '500',
  },
});