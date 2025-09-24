import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';

interface PasswordInputProps {
  value: string;
  onChangeText: (value: string) => void;
  showPassword: boolean;
  onTogglePassword: () => void;
  placeholder?: string;
  error?: string;
  showForgotPassword?: boolean;
  onForgotPassword?: () => void;
  showStrengthIndicator?: boolean;
  validatePassword?: (password: string) => string[];
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChangeText,
  showPassword,
  onTogglePassword,
  placeholder = "비밀번호를 입력하세요",
  error,
  showForgotPassword = false,
  onForgotPassword,
  showStrengthIndicator = false,
  validatePassword,
}) => {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>비밀번호</Text>
      <View style={[
        styles.passwordContainer,
        error && styles.inputWrapperError
      ]}>
        <TextInput
          style={styles.passwordInput}
          placeholder={placeholder}
          placeholderTextColor="#A0A0A0"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={onTogglePassword}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={showPassword ? 'eye-off' : 'eye'}
            size={20}
            color="#A0A0A0"
          />
        </TouchableOpacity>
      </View>
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {showStrengthIndicator && validatePassword && (
        <PasswordStrengthIndicator
          password={value}
          validatePassword={validatePassword}
        />
      )}

      {showForgotPassword && onForgotPassword && (
        <TouchableOpacity onPress={onForgotPassword}>
          <Text style={styles.forgotPassword}>비밀번호를 잊으셨나요?</Text>
        </TouchableOpacity>
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
  },
  eyeButton: {
    paddingHorizontal: 15,
    paddingVertical: 12,
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
  forgotPassword: {
    fontSize: 14,
    color: '#15803d',
    textAlign: 'right',
    marginTop: 8,
  },
});