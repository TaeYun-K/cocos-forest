import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export const LoginHeader: React.FC = () => {
  return (
    <View style={styles.header}>
      <Text style={styles.logo}>코코의 숲</Text>
      <Text style={styles.subtitle}>코코와 함께하는</Text>
      <Text style={styles.subtitle}>탄소 절약 챌린지</Text>

      <Image
        source={require('../../../assets/dashboard/coco-init-unscreen.gif')}
        style={styles.characterImage}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  logo: {
    fontSize: 36,
    color: '#0F172A',
    fontFamily: 'Jalnan2',
    marginBottom: 12,
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 17,
    color: '#374151',
    fontFamily: 'Jalnan2',
    fontWeight: '400',
    marginBottom: 6,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.08)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  characterImage: {
    width: 400,
    height: 300,
    marginTop: 0,
  },
});