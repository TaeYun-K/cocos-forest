import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

interface EmailInputProps {
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
}

export const EmailInput: React.FC<EmailInputProps> = ({ value, onChangeText, error }) => {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>이메일</Text>
      <View style={[
        styles.inputWrapper,
        error && styles.inputWrapperError
      ]}>
        <TextInput
          style={styles.input}
          placeholder="이메일을 입력하세요"
          placeholderTextColor="#A0A0A0"
          value={value}
          onChangeText={onChangeText}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
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
  errorText: {
    fontSize: 12,
    color: '#FF4444',
    marginTop: 4,
  },
});