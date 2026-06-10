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
  ScrollView,
} from 'react-native';
import MapView, {Marker, PROVIDER_DEFAULT} from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const MODES_EMOJI: any = {
  moto: '🏍️',
  economique: '🚗',
  confort: '🚙',
  premium: '🏎️',
  van: '🚐',
};

const calculerDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function DriverMapScreen({navigation}: any) {
  const [position, setPosition] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [courseSelectionnee, setCourseSelectionnee] = useState<any>(null);
  const [notificationEnvoyee, setNotificationEnvoyee] = useState(false);

  useEffect(() => {
    demanderPermission();
    const unsubscribe = ecouterCourses();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (position && courseSelectionnee) {
      mettreAJourPosition();
      verifierProximiteClient();
    }
  }, [position]);

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
    Geolocation.watchPosition(
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
        Alert.alert('Erreur', "Impossible d'obtenir la position");
        setLoading(false);
      },
      {enableHighAccuracy: true, distanceFilter: 10},
    );
  };

  const mettreAJourPosition = async () => {
    const user = auth().currentUser;
    if (!user || !position) {return;}
    try {
      await firestore()
        .collection('chauffeurs')
        .doc(user.uid)
        .set(
          {
            position: new firestore.GeoPoint(
              position.latitude,
              position.longitude,
            ),
            disponible: true,
            updatedAt: firestore.FieldValue.serverTimestamp(),
          },
          {merge: true},
        );
    } catch (error) {
      console.log('Erreur position:', error);
    }
  };

  const verifierProximiteClient = async () => {
    if (!courseSelectionnee || !position || notificationEnvoyee) {return;}
    const departLat = courseSelectionnee.depart?.latitude;
    const departLng = courseSelectionnee.depart?.longitude;
    if (!departLat || !departLng) {return;}

    const distanceMetres = calculerDistance(
      position.latitude,
      position.longitude,
      departLat,
      departLng,
    );

    if (distanceMetres <= 200) {
      setNotificationEnvoyee(true);
      await firestore()
        .collection('courses')
        .doc(courseSelectionnee.id)
        .update({
          chauffeurProche: true,
          chauffeurProcheAt: firestore.FieldValue.serverTimestamp(),
        });
      Alert.alert(
        'Client proche',
        'Vous etes arrive pres du client. Il a ete notifie.',
      );
    }
  };

  const ecouterCourses = () => {
    return firestore()
      .collection('courses')
      .where('statut', '==', 'en_attente')
      .onSnapshot(snapshot => {
        const coursesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCourses(coursesList);
      });
  };

  const accepterCourse = async (course: any) => {
    const user = auth().currentUser;
    try {
      await firestore()
        .collection('courses')
        .doc(course.id)
        .update({
          statut: 'acceptee',
          chauffeurId: user?.uid,
          chauffeurEmail: user?.email,
          acceptedAt: firestore.FieldValue.serverTimestamp(),
        });
      setCourseSelectionnee({...course, chauffeurId: user?.uid});
      setNotificationEnvoyee(false);
      Alert.alert('Succes', 'Course acceptee !');
    } catch (error) {
      Alert.alert('Erreur', "Impossible d'accepter la course");
    }
  };

  const refuserCourse = (courseId: string) => {
    setCourses(courses.filter(c => c.id !== courseId));
  };

  const terminerCourse = async () => {
    if (!courseSelectionnee) {return;}
    try {
      await firestore()
        .collection('courses')
        .doc(courseSelectionnee.id)
        .update({
          statut: 'terminee',
          termineAt: firestore.FieldValue.serverTimestamp(),
        });
      setCourseSelectionnee(null);
      setNotificationEnvoyee(false);
      Alert.alert('Succes', 'Course terminee !');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de terminer la course');
    }
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
            title="Ma position"
            pinColor="blue"
          />
          {courseSelectionnee?.depart && (
            <Marker
              coordinate={{
                latitude: courseSelectionnee.depart.latitude,
                longitude: courseSelectionnee.depart.longitude,
              }}
              title="Client"
              pinColor="green"
            />
          )}
          {courseSelectionnee?.destination && (
            <Marker
              coordinate={{
                latitude: courseSelectionnee.destination.latitude,
                longitude: courseSelectionnee.destination.longitude,
              }}
              title="Destination"
              pinColor="red"
            />
          )}
        </MapView>
      )}

      <View style={styles.panneau}>
        {courseSelectionnee ? (
          <ScrollView>
            <Text style={styles.panneauTitre}>Course en cours</Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Destination</Text>
              <Text style={styles.infoValeur}>
                {courseSelectionnee.destinationNom}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mode</Text>
              <Text style={styles.infoValeur}>
                {MODES_EMOJI[courseSelectionnee.modeVehicule] || '🚗'}{' '}
                {courseSelectionnee.modeVehicule}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tarif</Text>
              <Text style={styles.infoTarif}>
                {courseSelectionnee.tarif} FCFA
              </Text>
            </View>

            <TouchableOpacity
              style={styles.boutonChat}
              onPress={() =>
                navigation.navigate('Chat', {
                  courseId: courseSelectionnee.id,
                  destinataireId: courseSelectionnee.clientId,
                  destinataireNom: 'Client',
                })
              }>
              <Text style={styles.texteBouton}>Contacter le client</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.boutonTerminer}
              onPress={terminerCourse}>
              <Text style={styles.texteBouton}>Terminer la course</Text>
            </TouchableOpacity>
          </ScrollView>
        ) : courses.length > 0 ? (
          <ScrollView>
            <Text style={styles.panneauTitre}>
              Courses disponibles ({courses.length})
            </Text>
            {courses.map(course => (
              <View key={course.id} style={styles.courseCard}>
                <View style={styles.courseInfo}>
                  <Text style={styles.courseDestination}>
                    {MODES_EMOJI[course.modeVehicule] || '🚗'}{' '}
                    {course.destinationNom}
                  </Text>
                  <Text style={styles.courseTarif}>
                    {course.tarif} FCFA — {course.distance} km
                  </Text>
                  <Text style={styles.courseMode}>
                    Mode : {course.modeVehicule}
                  </Text>
                </View>
                <View style={styles.courseActions}>
                  <TouchableOpacity
                    style={styles.boutonAccepter}
                    onPress={() => accepterCourse(course)}>
                    <Text style={styles.texteBoutonSmall}>✅</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.boutonRefuser}
                    onPress={() => refuserCourse(course.id)}>
                    <Text style={styles.texteBoutonSmall}>❌</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.attente}>
            <Text style={styles.attenteTexte}>En attente de courses...</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.boutonRetour}
          onPress={() => navigation.goBack()}>
          <Text style={styles.texteRetour}>Retour</Text>
        </TouchableOpacity>
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
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
  },
  panneauTitre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  infoLabel: {color: '#aaa', fontSize: 14},
  infoValeur: {color: '#fff', fontSize: 14, fontWeight: 'bold'},
  infoTarif: {color: '#00b4d8', fontSize: 18, fontWeight: 'bold'},
  courseCard: {
    backgroundColor: '#16213e',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  courseInfo: {flex: 1},
  courseDestination: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  courseTarif: {color: '#00b4d8', fontSize: 13},
  courseMode: {color: '#888', fontSize: 12, marginTop: 2},
  courseActions: {flexDirection: 'row', gap: 8},
  boutonAccepter: {
    backgroundColor: '#2d7a2d',
    borderRadius: 8,
    padding: 10,
  },
  boutonRefuser: {
    backgroundColor: '#cc0000',
    borderRadius: 8,
    padding: 10,
  },
  texteBoutonSmall: {fontSize: 16},
  boutonTerminer: {
    backgroundColor: '#00b4d8',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  boutonChat: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#00b4d8',
  },
  boutonRetour: {padding: 10, alignItems: 'center'},
  texteRetour: {color: '#888', fontSize: 14},
  texteBouton: {color: '#fff', fontSize: 15, fontWeight: 'bold'},
  attente: {alignItems: 'center', padding: 20},
  attenteTexte: {color: '#aaa', fontSize: 16},
});