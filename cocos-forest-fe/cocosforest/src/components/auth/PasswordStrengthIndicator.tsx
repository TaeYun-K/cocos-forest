import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PasswordStrengthIndicatorProps {
  password: string;
  validatePassword: (password: string) => string[];
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  validatePassword,
}) => {
  const getPasswordStrength = (password: string): { level: number; text: string; color: string } => {
    if (password.length === 0) {
      return { level: 0, text: '', color: '#E0E0E0' };
    }

    const errors = validatePassword(password);
    if (errors.length > 2) {
      return { level: 1, text: '약함', color: '#FF5722' };
    } else if (errors.length > 0) {
      return { level: 2, text: '보통', color: '#FF9800' };
    } else {
      return { level: 3, text: '강함', color: '#4CAF50' };
    }
  };

  const passwordStrength = getPasswordStrength(password);

  if (password === '') return null;

  return (
    <View style={styles.strengthContainer}>
      <Text style={styles.strengthLabel}>강도: </Text>
      <View style={styles.strengthBars}>
        {[1, 2, 3].map((level) => (
          <View
            key={level}
            style={[
              styles.strengthBar,
              {
                backgroundColor: level <= passwordStrength.level
                  ? passwordStrength.color
                  : '#E0E0E0'
              }
            ]}
          />
        ))}
      </View>
      <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
        {passwordStrength.text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  strengthLabel: {
    fontSize: 12,
    color: '#666666',
    marginRight: 8,
  },
  strengthBars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  strengthBar: {
    width: 20,
    height: 4,
    marginRight: 2,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '500',
  },
});