import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {launchImageLibrary} from 'react-native-image-picker';

export default function ProfilScreen({navigation}: any) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [photo, setPhoto] = useState('');

  useEffect(() => {
    chargerProfil();
  }, []);

  const chargerProfil = async () => {
    const user = auth().currentUser;
    if (!user) {return;}
    try {
      const doc = await firestore().collection('users').doc(user.uid).get();
      const data = doc.data();
      setNom(data?.nom || '');
      setTelephone(data?.telephone || '');
      setEmail(user.email || '');
      setPhoto(data?.photo || '');
    } catch (error) {
      console.log('Erreur profil:', error);
    }
    setLoading(false);
  };

  const choisirPhoto = () => {
    launchImageLibrary(
      {mediaType: 'photo', quality: 0.8},
      response => {
        if (response.assets && response.assets[0]) {
          setPhoto(response.assets[0].uri || '');
        }
      },
    );
  };

  const sauvegarderProfil = async () => {
    if (!nom || !telephone) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    setSaving(true);
    try {
      const user = auth().currentUser;
      await firestore().collection('users').doc(user?.uid).update({
        nom,
        telephone,
        photo,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
      setSaving(false);
      Alert.alert('Succes', 'Profil mis a jour avec succes');
    } catch (error) {
      setSaving(false);
      Alert.alert('Erreur', 'Impossible de sauvegarder');
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#00b4d8" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.retour}>Retour</Text>
          </TouchableOpacity>
          <Text style={styles.titre}>Mon profil</Text>
        </View>

        <TouchableOpacity style={styles.photoContainer} onPress={choisirPhoto}>
          {photo ? (
            <Image source={{uri: photo}} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoEmoji}>👤</Text>
            </View>
          )}
          <Text style={styles.photoTexte}>Changer la photo</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Nom complet</Text>
        <TextInput
          style={styles.input}
          value={nom}
          onChangeText={setNom}
          placeholder="Votre nom"
          placeholderTextColor="#888"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, styles.inputDisabled]}
          value={email}
          editable={false}
        />

        <Text style={styles.label}>Telephone</Text>
        <TextInput
          style={styles.input}
          value={telephone}
          onChangeText={setTelephone}
          placeholder="+237 6XX XXX XXX"
          placeholderTextColor="#888"
          keyboardType="phone-pad"
        />

        <TouchableOpacity
          style={styles.boutonSauvegarder}
          onPress={sauvegarderProfil}
          disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.texteBouton}>Sauvegarder</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#1a1a2e'},
  container: {flexGrow: 1, padding: 20},
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  retour: {color: '#00b4d8', fontSize: 16, marginRight: 15},
  titre: {fontSize: 22, fontWeight: 'bold', color: '#fff'},
  photoContainer: {alignItems: 'center', marginBottom: 24},
  photo: {width: 100, height: 100, borderRadius: 50, marginBottom: 8},
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#16213e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  photoEmoji: {fontSize: 40},
  photoTexte: {color: '#00b4d8', fontSize: 14},
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
  inputDisabled: {opacity: 0.5},
  boutonSauvegarder: {
    backgroundColor: '#00b4d8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  texteBouton: {color: '#fff', fontSize: 16, fontWeight: 'bold'},
});