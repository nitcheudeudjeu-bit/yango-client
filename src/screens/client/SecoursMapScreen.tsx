import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  PermissionsAndroid,
  Platform,
  ScrollView,
} from 'react-native';
import MapView, {Marker, PROVIDER_DEFAULT} from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';

const TYPES_SECOURS = [
  {type: 'hospital', label: 'Hopital', emoji: '🏥', couleur: 'red'},
  {type: 'police', label: 'Police', emoji: '👮', couleur: 'blue'},
  {type: 'fire_station', label: 'Pompiers', emoji: '🚒', couleur: 'orange'},
  {type: 'pharmacy', label: 'Pharmacie', emoji: '💊', couleur: 'green'},
];

export default function SecoursMapScreen({navigation}: any) {
  const [position, setPosition] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pointsSecours, setPointsSecours] = useState<any[]>([]);
  const [recherche, setRecherche] = useState(false);
  const [typeSelectionne, setTypeSelectionne] = useState('hospital');

  useEffect(() => {
    demanderPermission();
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
        const coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };
        setPosition(coords);
        setLoading(false);
        rechercherPointsSecours(
          pos.coords.latitude,
          pos.coords.longitude,
          'hospital',
        );
      },
      error => {
        Alert.alert('Erreur', 'Impossible obtenir position');
        setLoading(false);
      },
      {enableHighAccuracy: true, timeout: 15000},
    );
  };

  const rechercherPointsSecours = async (
  lat: number,
  lng: number,
  type: string,
) => {
  setRecherche(true);
  setTypeSelectionne(type);
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${type}+near+${lat},${lng}&format=json&limit=10&bounded=1&viewbox=${lng-0.1},${lat+0.1},${lng+0.1},${lat-0.1}`,
      {
        headers: {
          'User-Agent': 'YangoApp/1.0',
          'Accept-Language': 'fr',
        },
      },
    );
    const data = await response.json();
    if (data && data.length > 0) {
      const points = data.map((el: any, index: number) => ({
        id: index,
        nom: el.display_name.split(',')[0],
        latitude: parseFloat(el.lat),
        longitude: parseFloat(el.lon),
        telephone: '',
        type,
      }));
      setPointsSecours(points);
    } else {
      setPointsSecours([]);
      Alert.alert('Info', 'Aucun point trouve dans votre zone');
    }
  } catch (error) {
    Alert.alert('Erreur', 'Verifiez votre connexion internet');
  }
  setRecherche(false);
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
          showsUserLocation={true}>
          <Marker
            coordinate={{
              latitude: position.latitude,
              longitude: position.longitude,
            }}
            title="Votre position"
            pinColor="blue"
          />
          {pointsSecours.map(point => (
            <Marker
              key={point.id}
              coordinate={{
                latitude: point.latitude,
                longitude: point.longitude,
              }}
              title={point.nom}
              description={point.telephone}
              pinColor="red"
            />
          ))}
        </MapView>
      )}

      <View style={styles.panneau}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.retour}>Retour</Text>
          </TouchableOpacity>
          <Text style={styles.titre}>Points de secours</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtres}>
          {TYPES_SECOURS.map(t => (
            <TouchableOpacity
              key={t.type}
              style={[
                styles.filtreBouton,
                typeSelectionne === t.type && styles.filtreBoutonActif,
              ]}
              onPress={() =>
                position &&
                rechercherPointsSecours(
                  position.latitude,
                  position.longitude,
                  t.type,
                )
              }>
              <Text style={styles.filtreTexte}>
                {t.emoji} {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {recherche ? (
          <ActivityIndicator color="#00b4d8" style={{marginTop: 10}} />
        ) : (
          <Text style={styles.resultats}>
            {pointsSecours.length} points trouves dans un rayon de 5 km
          </Text>
        )}

        <ScrollView style={styles.liste}>
          {pointsSecours.slice(0, 5).map(point => (
            <View key={point.id} style={styles.pointCard}>
              <Text style={styles.pointNom}>{point.nom}</Text>
              {point.telephone ? (
                <Text style={styles.pointTel}>{point.telephone}</Text>
              ) : null}
            </View>
          ))}
        </ScrollView>
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
  },
  loadingTexte: {color: '#fff', marginTop: 16, fontSize: 16},
  map: {flex: 1},
  panneau: {
    backgroundColor: '#1a1a2e',
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '45%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  retour: {color: '#00b4d8', fontSize: 16, marginRight: 15},
  titre: {fontSize: 18, fontWeight: 'bold', color: '#fff'},
  filtres: {marginBottom: 10},
  filtreBouton: {
    backgroundColor: '#16213e',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  filtreBoutonActif: {
    backgroundColor: '#00b4d8',
    borderColor: '#00b4d8',
  },
  filtreTexte: {color: '#fff', fontSize: 13},
  resultats: {color: '#888', fontSize: 12, marginBottom: 8},
  liste: {maxHeight: 150},
  pointCard: {
    backgroundColor: '#16213e',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  pointNom: {color: '#fff', fontSize: 14, fontWeight: 'bold'},
  pointTel: {color: '#00b4d8', fontSize: 12, marginTop: 4},
});