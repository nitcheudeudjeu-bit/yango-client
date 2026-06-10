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
  ScrollView,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export default function RegisterScreen({navigation}: any) {
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!nom || !email || !telephone || !password || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Erreur', 'Mot de passe trop court');
      return;
    }
    setLoading(true);
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(
        email,
        password,
      );
      const uid = userCredential.user.uid;
      await firestore().collection('users').doc(uid).set({
        uid,
        nom,
        email,
        telephone,
        role: 'client',
        createdAt: new Date(),
        isActive: true,
      });
      setLoading(false);
      Alert.alert('Succes', 'Compte client cree avec succes !', [
        {text: 'OK', onPress: () => navigation.navigate('Login')},
      ]);
    } catch (error: any) {
      setLoading(false);
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Erreur', 'Email deja utilise');
      } else {
        Alert.alert('Erreur', 'Inscription echouee');
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.retour}>Retour</Text>
          </TouchableOpacity>
          <Text style={styles.titre}>Creer un compte client</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeTexte}>Client</Text>
          </View>
        </View>

        <Text style={styles.label}>Nom complet</Text>
        <TextInput
          style={styles.input}
          placeholder="Jean Dupont"
          placeholderTextColor="#888"
          value={nom}
          onChangeText={setNom}
        />

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

        <Text style={styles.label}>Telephone</Text>
        <TextInput
          style={styles.input}
          placeholder="+237 6XX XXX XXX"
          placeholderTextColor="#888"
          value={telephone}
          onChangeText={setTelephone}
          keyboardType="phone-pad"
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

        <Text style={styles.label}>Confirmer mot de passe</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#888"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.bouton}
          onPress={handleRegister}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.texteBouton}>S inscrire comme client</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.connexion}>
            Deja un compte ?{' '}
            <Text style={styles.connexionLien}>Se connecter</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#1a1a2e'},
  container: {flexGrow: 1, padding: 24},
  header: {
    marginBottom: 24,
    marginTop: 10,
  },
  retour: {color: '#00b4d8', fontSize: 16, marginBottom: 12},
  titre: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: '#00b4d8',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  badgeTexte: {color: '#fff', fontSize: 12, fontWeight: 'bold'},
  label: {color: '#aaa', fontSize: 13, marginBottom: 6, marginTop: 12},
  input: {
    backgroundColor: '#16213e',
    borderRadius: 10,
    padding: 15,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  bouton: {
    backgroundColor: '#00b4d8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  texteBouton: {color: '#fff', fontSize: 16, fontWeight: 'bold'},
  connexion: {
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
    marginBottom: 30,
  },
  connexionLien: {color: '#00b4d8', fontWeight: 'bold'},
});