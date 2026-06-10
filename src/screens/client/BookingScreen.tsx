import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  ScrollView,
} from 'react-native';
import MapView, {Marker, PROVIDER_DEFAULT} from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import firestore from '@react-native-firebase/firestore';
import {firebase} from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import {
  calculerTarifDynamique,
  getLibelleType,
  MODES_VEHICULE,
} from '../../services/TarifService';

export default function BookingScreen({navigation}: any) {
  const [position, setPosition] = useState<any>(null);
  const [destination, setDestination] = useState('');
  const [destinationCoords, setDestinationCoords] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [tarif, setTarif] = useState(0);
  const [typeTarif, setTypeTarif] = useState('');
  const [modeVehicule, setModeVehicule] = useState('economique');
  const [distance, setDistance] = useState(0);
  const [etape, setEtape] = useState('carte');
  const [courseId, setCourseId] = useState<string | null>(null);
  const mapRef = useRef<any>(null);
  const unsubscribeRef = useRef<any>(null);

  useEffect(() => {
    demanderPermission();
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  const demanderPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        obtenirPosition();
      } else {
        Alert.alert('Erreur', 'Permission refusee');
        setLoading(false);
      }
    } else {
      obtenirPosition();
    }
  };

  const obtenirPosition = () => {
    Geolocation.getCurrentPosition(
      pos => {
        setPosition({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        setLoading(false);
      },
      error => {
        Alert.alert('Erreur', 'Impossible obtenir position');
        setLoading(false);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  const rechercherDestination = async () => {
    if (!destination) {
      Alert.alert('Erreur', 'Veuillez entrer une destination');
      return;
    }
    setSearching(true);
    try {
      const response = await fetch(
        'https://nominatim.openstreetmap.org/search?q=' +
          encodeURIComponent(destination) +
          '&format=json&limit=1',
        {headers: {'User-Agent': 'YangoApp/1.0'}},
      );
      const data = await response.json();
      if (data.length > 0) {
        const coords = {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
        };
        setDestinationCoords(coords);
        calculerTarif(coords.latitude, coords.longitude, modeVehicule);
        setEtape('modes');
      } else {
        Alert.alert('Erreur', 'Destination non trouvee');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Recherche echouee');
    }
    setSearching(false);
  };

  const calculerTarif = (
    destLat: number,
    destLng: number,
    mode: string,
  ) => {
    if (!position) {return;}
    const R = 6371;
    const dLat = ((destLat - position.latitude) * Math.PI) / 180;
    const dLon = ((destLng - position.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((position.latitude * Math.PI) / 180) *
        Math.cos((destLat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = R * c;
    setDistance(Math.round(dist * 10) / 10);
    const result = calculerTarifDynamique(dist, 15, mode);
    setTarif(result.tarif);
    setTypeTarif(result.typeHoraire);
  };

  const selectionnerMode = (mode: string) => {
    setModeVehicule(mode);
    if (destinationCoords) {
      calculerTarif(
        destinationCoords.latitude,
        destinationCoords.longitude,
        mode,
      );
    }
    setEtape('confirmation');
  };

  const ecouterStatutCourse = (id: string) => {
    const unsubscribe = firestore()
      .collection('courses')
      .doc(id)
      .onSnapshot(doc => {
        const data = doc.data();
        if (data?.statut === 'acceptee') {
          if (unsubscribeRef.current) {
            unsubscribeRef.current();
          }
          navigation.replace('SuiviCourse', {courseId: id});
        }
      });
    unsubscribeRef.current = unsubscribe;
  };

  const confirmerCourse = async () => {
    if (!position || !destinationCoords) {return;}
    setLoading(true);
    try {
      const user = auth().currentUser;
      const docRef = await firestore().collection('courses').add({
        clientId: user?.uid,
        clientEmail: user?.email,
        depart: {
          latitude: position.latitude,
          longitude: position.longitude,
        },
        destination: {
          latitude: destinationCoords.latitude,
          longitude: destinationCoords.longitude,
        },
        destinationNom: destination,
        tarif,
        typeTarif,
        modeVehicule,
        distance,
        statut: 'en_attente',
        createdAt: new Date().toISOString(),
      });
      setCourseId(docRef.id);
      ecouterStatutCourse(docRef.id);
      setLoading(false);
      setEtape('attente');
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Erreur', 'Impossible de creer la course: ' + error.message);
    }
  };

  const annulerCourse = async () => {
    if (courseId) {
      await firestore().collection('courses').doc(courseId).update({
        statut: 'annulee',
      });
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    }
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#00b4d8" />
        <Text style={styles.loadingTexte}>Chargement...</Text>
      </View>
    );
  }

  if (etape === 'attente') {
    return (
      <View style={styles.loading}>
        <Text style={styles.emoji}>⏳</Text>
        <Text style={styles.attenteTexte}>Recherche chauffeur...</Text>
        <Text style={styles.attenteSousTitre}>Veuillez patienter</Text>
        <ActivityIndicator
          size="large"
          color="#00b4d8"
          style={{marginBottom: 30}}
        />
        <TouchableOpacity style={styles.boutonAnnuler} onPress={annulerCourse}>
          <Text style={styles.texteBouton}>Annuler la course</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {position && (
        <MapView
          ref={mapRef}
          provider={PROVIDER_DEFAULT}
          style={styles.map}
          initialRegion={position}
          showsUserLocation={true}>
          <Marker
            coordinate={{
              latitude: position.latitude,
              longitude: position.longitude,
            }}
            title="Depart"
            pinColor="blue"
          />
          {destinationCoords && (
            <Marker
              coordinate={destinationCoords}
              title="Destination"
              pinColor="red"
            />
          )}
        </MapView>
      )}

      <View style={styles.panneau}>
        {etape === 'carte' && (
          <>
            <Text style={styles.panneauTitre}>Ou allez-vous ?</Text>
            <TextInput
              style={styles.input}
              placeholder="Entrez votre destination"
              placeholderTextColor="#888"
              value={destination}
              onChangeText={setDestination}
            />
            <TouchableOpacity
              style={styles.boutonRechercher}
              onPress={rechercherDestination}
              disabled={searching}>
              {searching ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.texteBouton}>Rechercher</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.boutonRetour}
              onPress={() => navigation.goBack()}>
              <Text style={styles.texteRetour}>Retour</Text>
            </TouchableOpacity>
          </>
        )}

        {etape === 'modes' && (
          <>
            <Text style={styles.panneauTitre}>Choisir le type de vehicule</Text>
            <ScrollView style={styles.modesScroll}>
              {MODES_VEHICULE.map(mode => (
                <TouchableOpacity
                  key={mode.id}
                  style={styles.modeCard}
                  onPress={() => selectionnerMode(mode.id)}>
                  <Text style={styles.modeEmoji}>{mode.emoji}</Text>
                  <View style={styles.modeInfo}>
                    <Text style={styles.modeNom}>{mode.nom}</Text>
                    <Text style={styles.modeDescription}>
                      {mode.description}
                    </Text>
                    <Text style={styles.modeCapacite}>
                      {mode.capacite}
                    </Text>
                  </View>
                  <Text style={styles.modeTarif}>
                    {Math.round(
                      calculerTarifDynamique(distance, 15, mode.id).tarif,
                    )}{' '}
                    FCFA
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.boutonRetour}
              onPress={() => setEtape('carte')}>
              <Text style={styles.texteRetour}>Retour</Text>
            </TouchableOpacity>
          </>
        )}

        {etape === 'confirmation' && (
          <>
            <Text style={styles.panneauTitre}>Confirmation</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Destination</Text>
              <Text style={styles.infoValeur}>{destination}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Distance</Text>
              <Text style={styles.infoValeur}>{distance} km</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mode</Text>
              <Text style={styles.infoValeur}>
                {MODES_VEHICULE.find(m => m.id === modeVehicule)?.emoji}{' '}
                {MODES_VEHICULE.find(m => m.id === modeVehicule)?.nom}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Type tarif</Text>
              <Text style={styles.infoValeur}>
                {getLibelleType(typeTarif)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tarif</Text>
              <Text style={styles.infoTarif}>{tarif} FCFA</Text>
            </View>
            <TouchableOpacity
              style={styles.boutonConfirmer}
              onPress={confirmerCourse}>
              <Text style={styles.texteBouton}>Confirmer la course</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.boutonRetour}
              onPress={() => setEtape('modes')}>
              <Text style={styles.texteRetour}>Changer le mode</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    padding: 24,
  },
  loadingTexte: {color: '#fff', marginTop: 16, fontSize: 16},
  emoji: {fontSize: 60, marginBottom: 20},
  attenteTexte: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  attenteSousTitre: {fontSize: 14, color: '#888', marginBottom: 20},
  map: {flex: 1},
  panneau: {
    backgroundColor: '#1a1a2e',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '55%',
  },
  panneauTitre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#16213e',
    borderRadius: 10,
    padding: 15,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 10,
  },
  modesScroll: {maxHeight: 300},
  modeCard: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  modeEmoji: {fontSize: 32, marginRight: 12},
  modeInfo: {flex: 1},
  modeNom: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  modeDescription: {color: '#888', fontSize: 12},
  modeCapacite: {color: '#00b4d8', fontSize: 12, marginTop: 2},
  modeTarif: {
    color: '#00b4d8',
    fontSize: 16,
    fontWeight: 'bold',
  },
  boutonRechercher: {
    backgroundColor: '#00b4d8',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  boutonConfirmer: {
    backgroundColor: '#00b4d8',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  boutonAnnuler: {
    backgroundColor: '#cc0000',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    width: '80%',
  },
  boutonRetour: {padding: 10, alignItems: 'center'},
  texteBouton: {color: '#fff', fontSize: 15, fontWeight: 'bold'},
  texteRetour: {color: '#888', fontSize: 14},
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  infoLabel: {color: '#aaa', fontSize: 14},
  infoValeur: {color: '#fff', fontSize: 14, fontWeight: 'bold'},
  infoTarif: {color: '#00b4d8', fontSize: 18, fontWeight: 'bold'},
});