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

export default function ProfilDriverScreen({navigation}: any) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [vehiculeMarque, setVehiculeMarque] = useState('');
  const [vehiculeModele, setVehiculeModele] = useState('');
  const [vehiculeCouleur, setVehiculeCouleur] = useState('');
  const [vehiculePlaque, setVehiculePlaque] = useState('');
  const [photo, setPhoto] = useState('');
  const [noteMoyenne, setNoteMoyenne] = useState(0);
  const [totalCourses, setTotalCourses] = useState(0);

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
      setVehiculeMarque(data?.vehicule?.marque || '');
      setVehiculeModele(data?.vehicule?.modele || '');
      setVehiculeCouleur(data?.vehicule?.couleur || '');
      setVehiculePlaque(data?.vehicule?.plaque || '');
      setPhoto(data?.photo || '');

      const coursesSnap = await firestore()
        .collection('courses')
        .where('chauffeurId', '==', user.uid)
        .where('statut', '==', 'terminee')
        .get();
      setTotalCourses(coursesSnap.size);

      const evalsSnap = await firestore()
        .collection('evaluations')
        .where('chauffeurId', '==', user.uid)
        .get();
      if (evalsSnap.size > 0) {
        const total = evalsSnap.docs.reduce(
          (sum, doc) => sum + (doc.data().note || 0),
          0,
        );
        setNoteMoyenne(Math.round((total / evalsSnap.size) * 10) / 10);
      }
    } catch (error) {
      console.log('Erreur profil chauffeur:', error);
    }
    setLoading(false);
  };

  const choisirPhoto = () => {
    launchImageLibrary({mediaType: 'photo', quality: 0.8}, response => {
      if (response.assets && response.assets[0]) {
        setPhoto(response.assets[0].uri || '');
      }
    });
  };

  const sauvegarder = async () => {
    if (!nom || !telephone || !vehiculePlaque) {
      Alert.alert('Erreur', 'Veuillez remplir les champs obligatoires');
      return;
    }
    setSaving(true);
    try {
      const user = auth().currentUser;
      await firestore()
        .collection('users')
        .doc(user?.uid)
        .update({
          nom,
          telephone,
          photo,
          vehicule: {
            marque: vehiculeMarque,
            modele: vehiculeModele,
            couleur: vehiculeCouleur,
            plaque: vehiculePlaque,
          },
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
      setSaving(false);
      Alert.alert('Succes', 'Profil mis a jour');
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
              <Text style={styles.photoEmoji}>🚗</Text>
            </View>
          )}
          <Text style={styles.photoTexte}>Changer la photo</Text>
        </TouchableOpacity>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValeur}>{totalCourses}</Text>
            <Text style={styles.statLabel}>Courses</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValeur, {color: '#FFD700'}]}>
              {noteMoyenne > 0 ? noteMoyenne : '-'}
            </Text>
            <Text style={styles.statLabel}>Note moyenne</Text>
          </View>
        </View>

        <Text style={styles.sectionTitre}>Informations personnelles</Text>

        <Text style={styles.label}>Nom complet *</Text>
        <TextInput
          style={styles.input}
          value={nom}
          onChangeText={setNom}
          placeholder="Votre nom"
          placeholderTextColor="#888"
        />

        <Text style={styles.label}>Telephone *</Text>
        <TextInput
          style={styles.input}
          value={telephone}
          onChangeText={setTelephone}
          placeholder="+237 6XX XXX XXX"
          placeholderTextColor="#888"
          keyboardType="phone-pad"
        />

        <Text style={styles.sectionTitre}>Informations vehicule</Text>

        <Text style={styles.label}>Marque</Text>
        <TextInput
          style={styles.input}
          value={vehiculeMarque}
          onChangeText={setVehiculeMarque}
          placeholder="Toyota, Renault..."
          placeholderTextColor="#888"
        />

        <Text style={styles.label}>Modele</Text>
        <TextInput
          style={styles.input}
          value={vehiculeModele}
          onChangeText={setVehiculeModele}
          placeholder="Corolla, Clio..."
          placeholderTextColor="#888"
        />

        <Text style={styles.label}>Couleur</Text>
        <TextInput
          style={styles.input}
          value={vehiculeCouleur}
          onChangeText={setVehiculeCouleur}
          placeholder="Blanc, Noir..."
          placeholderTextColor="#888"
        />

        <Text style={styles.label}>Plaque immatriculation *</Text>
        <TextInput
          style={styles.input}
          value={vehiculePlaque}
          onChangeText={setVehiculePlaque}
          placeholder="LT 1234 A"
          placeholderTextColor="#888"
          autoCapitalize="characters"
        />

        <TouchableOpacity
          style={styles.boutonSauvegarder}
          onPress={sauvegarder}
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
    marginBottom: 20,
    marginTop: 10,
  },
  retour: {color: '#00b4d8', fontSize: 16, marginRight: 15},
  titre: {fontSize: 22, fontWeight: 'bold', color: '#fff'},
  photoContainer: {alignItems: 'center', marginBottom: 16},
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  stat: {alignItems: 'center'},
  statValeur: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {fontSize: 12, color: '#888'},
  sectionTitre: {
    color: '#00b4d8',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  label: {color: '#aaa', fontSize: 13, marginBottom: 6, marginTop: 8},
  input: {
    backgroundColor: '#16213e',
    borderRadius: 10,
    padding: 15,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  boutonSauvegarder: {
    backgroundColor: '#00b4d8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  texteBouton: {color: '#fff', fontSize: 16, fontWeight: 'bold'},
});