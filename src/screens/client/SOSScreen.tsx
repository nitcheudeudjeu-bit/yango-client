import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Linking,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const URGENCES = [
  {nom: 'SAMU', telephone: '15', emoji: '🚑'},
  {nom: 'Pompiers', telephone: '18', emoji: '🚒'},
  {nom: 'Police', telephone: '17', emoji: '👮'},
  {nom: 'Hopital Central', telephone: '+237222231515', emoji: '🏥'},
];

export default function SOSScreen({navigation}: any) {
  const [position, setPosition] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [sosEnvoye, setSosEnvoye] = useState(false);

  useEffect(() => {
    obtenirPosition();
  }, []);

  const obtenirPosition = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
    }
    Geolocation.getCurrentPosition(
      pos => {
        setPosition({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      error => console.log(error),
      {enableHighAccuracy: true, timeout: 15000},
    );
  };

  const envoyerSOS = async () => {
    Alert.alert(
      'ALERTE SOS',
      'Voulez-vous envoyer une alerte SOS ?',
      [
        {text: 'Annuler', style: 'cancel'},
        {
          text: 'ENVOYER SOS',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const user = auth().currentUser;
              await firestore().collection('alertes_sos').add({
                userId: user?.uid,
                userEmail: user?.email,
                position: position
                  ? new firestore.GeoPoint(
                      position.latitude,
                      position.longitude,
                    )
                  : null,
                statut: 'active',
                createdAt: firestore.FieldValue.serverTimestamp(),
              });
              setSosEnvoye(true);
              setLoading(false);
              Alert.alert('SOS Envoye', 'Les secours ont ete notifies');
            } catch (error) {
              setLoading(false);
              Alert.alert('Erreur', 'Impossible envoyer SOS');
            }
          },
        },
      ],
    );
  };

  const appeler = (telephone: string) => {
    Linking.openURL('tel:' + telephone);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.retour}>Retour</Text>
          </TouchableOpacity>
          <Text style={styles.titre}>Securite</Text>
        </View>

        {/* Bouton SOS */}
        <TouchableOpacity
          style={[styles.boutonSOS, sosEnvoye && styles.boutonSOSEnvoye]}
          onPress={envoyerSOS}
          disabled={loading || sosEnvoye}>
          {loading ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <>
              <Text style={styles.sosEmoji}>🆘</Text>
              <Text style={styles.sosTexte}>
                {sosEnvoye ? 'SOS ENVOYE' : 'BOUTON SOS'}
              </Text>
              <Text style={styles.sosSousTitre}>
                {sosEnvoye ? 'Secours alertes' : 'Appuyez en cas urgence'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Boutons actions */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('Camera')}>
            <Text style={styles.actionEmoji}>📹</Text>
            <Text style={styles.actionTexte}>Filmer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('SecoursMap')}>
            <Text style={styles.actionEmoji}>🗺️</Text>
            <Text style={styles.actionTexte}>Carte secours</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('PremierSecours')}>
            <Text style={styles.actionEmoji}>🩺</Text>
            <Text style={styles.actionTexte}>Premiers secours</Text>
          </TouchableOpacity>
        </View>

        {/* Numeros urgence */}
        <Text style={styles.titreUrgences}>Numeros d urgence</Text>
        {URGENCES.map((u, i) => (
          <TouchableOpacity
            key={i}
            style={styles.urgenceCard}
            onPress={() => appeler(u.telephone)}>
            <Text style={styles.urgenceNom}>
              {u.emoji} {u.nom}
            </Text>
            <Text style={styles.urgenceTel}>{u.telephone}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#1a1a2e'},
  container: {flexGrow: 1, padding: 20},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  retour: {color: '#00b4d8', fontSize: 16, marginRight: 15},
  titre: {fontSize: 22, fontWeight: 'bold', color: '#fff'},
  boutonSOS: {
    backgroundColor: '#cc0000',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#ff0000',
  },
  boutonSOSEnvoye: {
    backgroundColor: '#2d7a2d',
    borderColor: '#4CAF50',
  },
  sosEmoji: {fontSize: 50, marginBottom: 8},
  sosTexte: {fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 4},
  sosSousTitre: {fontSize: 13, color: '#ffaaaa', textAlign: 'center'},
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionBtn: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 0.3,
    borderWidth: 1,
    borderColor: '#333',
  },
  actionEmoji: {fontSize: 28, marginBottom: 6},
  actionTexte: {color: '#fff', fontSize: 11, textAlign: 'center'},
  titreUrgences: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  urgenceCard: {
    backgroundColor: '#16213e',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  urgenceNom: {color: '#fff', fontSize: 14, fontWeight: 'bold'},
  urgenceTel: {color: '#00b4d8', fontSize: 13},
});