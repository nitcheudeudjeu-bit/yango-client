import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export default function LoginScreen({navigation}: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    setLoading(true);
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const uid = userCredential.user.uid;
      const userDoc = await firestore().collection('users').doc(uid).get();
      const userData = userDoc.data();
      setLoading(false);

      // Verifier que c est bien un client
      if (userData?.role === 'driver') {
        await auth().signOut();
        Alert.alert('Erreur', 'Ce compte est un compte chauffeur. Utilisez l app chauffeur.');
        return;
      }
      navigation.replace('ClientHome');
    } catch (error: any) {
      setLoading(false);
      if (error.code === 'auth/user-not-found') {
        Alert.alert('Erreur', 'Utilisateur non trouve');
      } else if (error.code === 'auth/wrong-password') {
        Alert.alert('Erreur', 'Mot de passe incorrect');
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('Erreur', 'Email invalide');
      } else {
        Alert.alert('Erreur', 'Connexion echouee');
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/logo.jpg')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.appNom}>YANGO</Text>
          <Text style={styles.sousTitre}>Votre trajet, notre priorite</Text>
          <View style={styles.badgeClient}>
            <Text style={styles.badgeTexte}>Application Client</Text>
          </View>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="votre@email.com"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Mot de passe</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgotPassword}>Mot de passe oublie ?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.boutonConnexion}
            onPress={handleLogin}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.texteBouton}>Se connecter</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.inscription}>
              Pas de compte ?{' '}
              <Text style={styles.inscriptionLien}>S inscrire</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoImage: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },
  appNom: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00b4d8',
    letterSpacing: 6,
    marginBottom: 4,
  },
  sousTitre: {
    fontSize: 14,
    color: '#888',
    marginBottom: 12,
  },
  badgeClient: {
    backgroundColor: '#00b4d8',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  badgeTexte: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  form: {
    width: '100%',
  },
  label: {
    color: '#aaa',
    fontSize: 13,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#16213e',
    borderRadius: 10,
    padding: 15,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  forgotPassword: {
    color: '#00b4d8',
    textAlign: 'right',
    marginTop: 8,
    fontSize: 13,
  },
  boutonConnexion: {
    backgroundColor: '#00b4d8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  texteBouton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inscription: {
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
  inscriptionLien: {
    color: '#00b4d8',
    fontWeight: 'bold',
  },
});