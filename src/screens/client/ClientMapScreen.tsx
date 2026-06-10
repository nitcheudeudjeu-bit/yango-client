import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import MapView, {Marker, PROVIDER_DEFAULT} from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';

export default function ClientMapScreen({navigation}: any) {
  const [position, setPosition] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    demanderPermission();
  }, []);

  const demanderPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Permission de localisation',
          message: 'Yango a besoin de votre localisation',
          buttonPositive: 'OK',
          buttonNegative: 'Annuler',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        obtenirPosition();
      } else {
        Alert.alert('Erreur', 'Permission de localisation refusée');
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
        Alert.alert('Erreur', 'Impossible d\'obtenir la position');
        setLoading(false);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#00b4d8" />
        <Text style={styles.loadingTexte}>Localisation en cours...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {position && (
        <MapView
          provider={PROVIDER_DEFAULT}
          style={styles.map}
          initialRegion={position}
          showsUserLocation={true}
          showsMyLocationButton={true}>
          <Marker
            coordinate={{
              latitude: position.latitude,
              longitude: position.longitude,
            }}
            title="Ma position"
            description="Vous êtes ici"
          />
        </MapView>
      )}

      <View style={styles.boutonContainer}>
        <TouchableOpacity
          style={styles.boutonRetour}
          onPress={() => navigation.goBack()}>
          <Text style={styles.texteBouton}>← Retour</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.boutonCourse}
          onPress={() => navigation.navigate('Booking')}>
          <Text style={styles.texteBouton}>🚕 Commander ici</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  loadingTexte: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
  },
  map: {
    flex: 1,
  },
  boutonContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  boutonRetour: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    flex: 0.4,
  },
  boutonCourse: {
    backgroundColor: '#00b4d8',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    flex: 0.55,
  },
  texteBouton: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});