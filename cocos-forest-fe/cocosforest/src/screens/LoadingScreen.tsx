import React, { useEffect, useState } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

const LoadingScreen: React.FC = () => {
  const [dots, setDots] = useState('.');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '.') return '..';
        if (prev === '..') return '...';
        return '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/coco-loading-unscreen.gif')}
        style={styles.loadingGif}
        resizeMode="contain"
      />
      <Text style={styles.text}>로딩중{dots}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ededed',
  },
  loadingGif: {
    width: 200,
    height: 200,
  },
  text: {
    marginTop: 20,
    fontSize: 18,
    color: '#1f2937',
    fontWeight: '600',
  },
});

export default LoadingScreen;