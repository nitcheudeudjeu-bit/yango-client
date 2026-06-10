import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import MapView, {Marker, PROVIDER_DEFAULT} from 'react-native-maps';
import firestore from '@react-native-firebase/firestore';

export default function SuiviCourseScreen({navigation, route}: any) {
  const {courseId} = route.params || {};
  const [course, setCourse] = useState<any>(null);
  const [chauffeur, setChauffeur] = useState<any>(null);
  const [positionChauffeur, setPositionChauffeur] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) {return;}
    const unsubscribe = firestore()
      .collection('courses')
      .doc(courseId)
      .onSnapshot(async doc => {
        const data = doc.data();
        setCourse(data);
        setLoading(false);

        if (data?.chauffeurId) {
          try {
            const chauffeurDoc = await firestore()
              .collection('users')
              .doc(data.chauffeurId)
              .get();
            const chauffeurData = chauffeurDoc.data();
            setChauffeur(chauffeurData);

            const posDoc = await firestore()
              .collection('chauffeurs')
              .doc(data.chauffeurId)
              .get();
            const posData = posDoc.data();
            if (posData?.position) {
              setPositionChauffeur({
                latitude: posData.position.latitude,
                longitude: posData.position.longitude,
              });
            }
          } catch (error) {
            console.log('Erreur chauffeur:', error);
          }

          if (data?.chauffeurProche && !data?.notificationProcheVue) {
            Alert.alert(
              'Chauffeur arrive !',
              'Votre chauffeur est arrive pres de vous !',
              [{text: 'OK'}],
            );
            await firestore()
              .collection('courses')
              .doc(courseId)
              .update({notificationProcheVue: true});
          }

          if (data?.statut === 'terminee') {
            navigation.replace('Evaluation', {
              courseId,
              chauffeurId: data.chauffeurId,
              tarif: data.tarif,
            });
          }
        }
      });
    return () => unsubscribe();
  }, [courseId]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#00b4d8" />
        <Text style={styles.loadingTexte}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {course?.depart && (
        <MapView
          provider={PROVIDER_DEFAULT}
          style={styles.map}
          initialRegion={{
            latitude: course.depart.latitude,
            longitude: course.depart.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}>
          <Marker
            coordinate={{
              latitude: course.depart.latitude,
              longitude: course.depart.longitude,
            }}
            title="Votre position"
            pinColor="blue"
          />
          {course?.destination && (
            <Marker
              coordinate={{
                latitude: course.destination.latitude,
                longitude: course.destination.longitude,
              }}
              title="Destination"
              pinColor="red"
            />
          )}
          {positionChauffeur && (
            <Marker
              coordinate={positionChauffeur}
              title="Chauffeur"
              pinColor="green"
            />
          )}
        </MapView>
      )}

      <ScrollView style={styles.panneau}>
        <Text style={styles.statut}>
          {course?.statut === 'acceptee' ? 'Chauffeur en route' :
           course?.statut === 'en_cours' ? 'Course en cours' :
           'En attente'}
        </Text>

        {chauffeur && (
          <View style={styles.chauffeurCard}>
            <Text style={styles.chauffeurTitre}>Votre chauffeur</Text>
            <View style={styles.chauffeurRow}>
              <Text style={styles.chauffeurEmoji}>👤</Text>
              <View style={styles.chauffeurInfo}>
                <Text style={styles.chauffeurNom}>
                  {chauffeur.nom || 'Chauffeur'}
                </Text>
                <Text style={styles.chauffeurTel}>
                  {chauffeur.telephone || 'Non renseigne'}
                </Text>
              </View>
            </View>
            {chauffeur.vehicule && (
              <View style={styles.vehiculeInfo}>
                <Text style={styles.vehiculeTexte}>
                  🚗 {chauffeur.vehicule.marque || ''}{' '}
                  {chauffeur.vehicule.modele || ''} —{' '}
                  {chauffeur.vehicule.couleur || ''}
                </Text>
                <Text style={styles.vehiculePlaque}>
                  🔢 {chauffeur.vehicule.plaque || 'Plaque non renseignee'}
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Destination</Text>
          <Text style={styles.infoValeur}>{course?.destinationNom}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Mode</Text>
          <Text style={styles.infoValeur}>{course?.modeVehicule || 'standard'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Tarif</Text>
          <Text style={styles.infoTarif}>{course?.tarif} FCFA</Text>
        </View>

        {course?.chauffeurId && (
          <TouchableOpacity
            style={styles.boutonChat}
            onPress={() =>
              navigation.navigate('Chat', {
                courseId,
                destinataireId: course.chauffeurId,
                destinataireNom: chauffeur?.nom || 'Chauffeur',
              })
            }>
            <Text style={styles.texteBouton}>Contacter le chauffeur</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.boutonAnnuler}
          onPress={() => {
            Alert.alert(
              'Annuler',
              'Voulez-vous annuler la course ?',
              [
                {text: 'Non', style: 'cancel'},
                {
                  text: 'Oui',
                  onPress: async () => {
                    await firestore()
                      .collection('courses')
                      .doc(courseId)
                      .update({statut: 'annulee'});
                    navigation.goBack();
                  },
                },
              ],
            );
          }}>
          <Text style={styles.texteBouton}>Annuler la course</Text>
        </TouchableOpacity>
      </ScrollView>
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
    maxHeight: '55%',
  },
  statut: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00b4d8',
    textAlign: 'center',
    marginBottom: 16,
  },
  chauffeurCard: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  chauffeurTitre: {
    color: '#888',
    fontSize: 12,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  chauffeurRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  chauffeurEmoji: {fontSize: 36, marginRight: 12},
  chauffeurInfo: {flex: 1},
  chauffeurNom: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  chauffeurTel: {color: '#00b4d8', fontSize: 14},
  vehiculeInfo: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 10,
  },
  vehiculeTexte: {color: '#fff', fontSize: 14, marginBottom: 4},
  vehiculePlaque: {color: '#aaa', fontSize: 13},
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#16213e',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  infoLabel: {color: '#aaa', fontSize: 14},
  infoValeur: {color: '#fff', fontSize: 14, fontWeight: 'bold'},
  infoTarif: {color: '#00b4d8', fontSize: 16, fontWeight: 'bold'},
  boutonChat: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#00b4d8',
  },
  boutonAnnuler: {
    backgroundColor: '#cc0000',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  texteBouton: {color: '#fff', fontSize: 15, fontWeight: 'bold'},
});