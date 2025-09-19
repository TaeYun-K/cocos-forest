import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PasswordConfirmInputProps {
  value: string;
  onChangeText: (value: string) => void;
  showPassword: boolean;
  onTogglePassword: () => void;
  isPasswordMatch: boolean;
  placeholder?: string;
  error?: string;
}

export const PasswordConfirmInput: React.FC<PasswordConfirmInputProps> = ({
  value,
  onChangeText,
  showPassword,
  onTogglePassword,
  isPasswordMatch,
  placeholder = "12345678",
  error,
}) => {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>비밀번호 확인 *</Text>
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

      {value !== '' && (
        <Text style={[
          styles.matchText,
          { color: isPasswordMatch ? '#4CAF50' : '#FF5722' }
        ]}>
          {isPasswordMatch ? '비밀번호가 일치합니다' : '비밀번호가 일치하지 않습니다'}
        </Text>
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
  matchText: {
    fontSize: 12,
    marginTop: 5,
    fontWeight: '500',
  },
});