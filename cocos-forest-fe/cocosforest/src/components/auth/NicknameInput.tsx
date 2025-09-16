import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';

interface NicknameInputProps {
  value: string;
  onChangeText: (value: string) => void;
  onCheckDuplicate: () => void;
  isLoading: boolean;
  isChecked: boolean;
  error?: string;
}

export const NicknameInput: React.FC<NicknameInputProps> = ({
  value,
  onChangeText,
  onCheckDuplicate,
  isLoading,
  isChecked,
  error,
}) => {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>닉네임 *</Text>
      <View style={styles.inputWithButton}>
        <View style={[
          styles.inputWrapper,
          { flex: 1, marginRight: 8 },
          error && styles.inputWrapperError
        ]}>
          <TextInput
            style={styles.input}
            placeholder="coco"
            placeholderTextColor="#A0A0A0"
            value={value}
            onChangeText={onChangeText}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        <TouchableOpacity
          style={[styles.checkButton, isChecked && styles.checkedButton]}
          onPress={onCheckDuplicate}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={[styles.checkButtonText, isChecked && styles.checkedButtonText]}>
              {isChecked ? '확인됨' : '중복확인'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      <Text style={styles.helperText}>사용 가능한 닉네임입니다</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
  },
  input: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  inputWrapperError: {
    borderColor: '#FF4444',
    backgroundColor: '#FFF8F8',
  },
  inputWithButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkButton: {
    backgroundColor: '#7CB342',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    minHeight: 50,
  },
  checkedButton: {
    backgroundColor: '#4CAF50',
  },
  checkButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  checkedButtonText: {
    color: '#FFFFFF',
  },
  errorText: {
    fontSize: 12,
    color: '#FF4444',
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#7CB342',
    marginTop: 5,
  },
});