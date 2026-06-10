import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
} from 'react-native';
import auth from '@react-native-firebase/auth';

export default function SplashScreen({navigation}: any) {
  useEffect(() => {
    const timer = setTimeout(() => {
      const user = auth().currentUser;
      if (user) {
        navigation.replace('ClientHome');
      } else {
        navigation.replace('Login');
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/logo.jpg')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.titre}>YANGO</Text>
      <Text style={styles.sousTitre}>Votre trajet, notre priorite</Text>
      <View style={styles.dotsContainer}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 20,
  },
  titre: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#00b4d8',
    letterSpacing: 8,
    marginBottom: 8,
  },
  sousTitre: {
    fontSize: 14,
    color: '#888',
    marginBottom: 40,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#333',
    marginHorizontal: 5,
  },
  dotActive: {
    backgroundColor: '#00b4d8',
  },
});