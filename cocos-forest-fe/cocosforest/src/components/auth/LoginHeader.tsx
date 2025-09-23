import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export const LoginHeader: React.FC = () => {
  return (
    <View style={styles.header}>
      <Text style={styles.logo}>코코의 숲</Text>
      <Text style={styles.subtitle}>코코와 함께하는</Text>
      <Text style={styles.subtitle}>탄소 절약 챌린지</Text>

      <View style={styles.characterContainer}>
        <Image
          source={require('../../../assets/coconut_character.png')}
          style={styles.characterImage}
          resizeMode="contain"
        />
      </View>
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 5,
  },
  characterContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  characterImage: {
    width: 120,
    height: 120,
  },
});