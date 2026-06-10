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
} from 'react-native';
import auth from '@react-native-firebase/auth';

export default function ForgotPasswordScreen({navigation}: any) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [envoye, setEnvoye] = useState(false);

  const handleReset = async () => {
    if (!email) {
      Alert.alert('Erreur', 'Veuillez entrer votre email');
      return;
    }
    setLoading(true);
    try {
      await auth().sendPasswordResetEmail(email);
      setLoading(false);
      setEnvoye(true);
    } catch (error: any) {
      setLoading(false);
      if (error.code === 'auth/user-not-found') {
        Alert.alert('Erreur', 'Aucun compte avec cet email');
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('Erreur', 'Email invalide');
      } else {
        Alert.alert('Erreur', 'Echec de l\'envoi');
      }
    }
  };

  if (envoye) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.emoji}>📧</Text>
          <Text style={styles.titre}>Email envoyé !</Text>
          <Text style={styles.sousTitre}>
            Vérifiez votre boîte mail pour réinitialiser votre mot de passe
          </Text>
          <TouchableOpacity
            style={styles.bouton}
            onPress={() => navigation.navigate('Login')}>
            <Text style={styles.texteBouton}>Retour à la connexion</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.retour}>← Retour</Text>
        </TouchableOpacity>

        <Text style={styles.emoji}>🔑</Text>
        <Text style={styles.titre}>Mot de passe oublié</Text>
        <Text style={styles.sousTitre}>
          Entrez votre email pour recevoir un lien de réinitialisation
        </Text>

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

        <TouchableOpacity
          style={styles.bouton}
          onPress={handleReset}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.texteBouton}>Envoyer le lien</Text>
          )}
        </TouchableOpacity>
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
  retour: {
    color: '#00b4d8',
    fontSize: 16,
    marginBottom: 30,
  },
  emoji: {
    fontSize: 60,
    textAlign: 'center',
    marginBottom: 20,
  },
  titre: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  sousTitre: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  label: {
    color: '#aaa',
    fontSize: 13,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#16213e',
    borderRadius: 10,
    padding: 15,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 20,
  },
  bouton: {
    backgroundColor: '#00b4d8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  texteBouton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});