import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors } from '../../styles/commonStyles';

interface SignupHeaderProps {
  currentStep: number;
  stepTitle: string;
}

export const SignupHeader: React.FC<SignupHeaderProps> = ({ currentStep, stepTitle }) => {
  return (
    <View style={styles.header}>
      <Image
        source={require('../../../assets/logotree.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.stepContainer}>
        <View style={[styles.step, currentStep >= 1 && styles.activeStep]}>
          <Text style={currentStep >= 1 ? styles.activeStepText : styles.stepText}>1</Text>
        </View>
        <View style={[styles.stepLine, currentStep > 1 && styles.completedStepLine]} />
        <View style={[styles.step, currentStep >= 2 && styles.activeStep]}>
          <Text style={currentStep >= 2 ? styles.activeStepText : styles.stepText}>2</Text>
        </View>
        <View style={[styles.stepLine, currentStep > 2 && styles.completedStepLine]} />
        <View style={[styles.step, currentStep >= 3 && styles.activeStep]}>
          <Text style={currentStep >= 3 ? styles.activeStepText : styles.stepText}>3</Text>
        </View>
      </View>

      <Text style={styles.stepTitle}>{stepTitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 30,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  step: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activeStep: {
    backgroundColor: colors.white,
  },
  stepLine: {
    width: 60,
    height: 2,
    backgroundColor: colors.gray300,
    marginHorizontal: 10,
  },
  completedStepLine: {
    backgroundColor: colors.primary,
  },
  stepText: {
    fontSize: 16,
    color: colors.gray400,
    fontWeight: 'bold',
  },
  activeStepText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: 'bold',
  },
  stepTitle: {
    fontSize: 18,
    color: colors.textPrimary,
    fontWeight: '500',
  },
});