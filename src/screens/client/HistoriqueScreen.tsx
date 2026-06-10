import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export default function HistoriqueScreen({navigation}: any) {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    chargerHistorique();
  }, []);

  const chargerHistorique = async () => {
    setLoading(true);
    setErreur('');
    const user = auth().currentUser;
    if (!user) {
      setErreur('Utilisateur non connecte');
      setLoading(false);
      return;
    }
    try {
      const snapshot = await firestore()
        .collection('courses')
        .where('clientId', '==', user.uid)
        .get();

      if (snapshot.empty) {
        setCourses([]);
      } else {
        const list = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCourses(list);
      }
    } catch (error: any) {
      setErreur(error.message);
    }
    setLoading(false);
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'terminee': return '#4CAF50';
      case 'acceptee': return '#00b4d8';
      case 'en_attente': return '#ff9800';
      case 'annulee': return '#cc0000';
      default: return '#888';
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#00b4d8" />
        <Text style={styles.loadingTexte}>Chargement...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.retour}>Retour</Text>
          </TouchableOpacity>
          <Text style={styles.titre}>Historique</Text>
          <TouchableOpacity onPress={chargerHistorique}>
            <Text style={styles.recharger}>Actualiser</Text>
          </TouchableOpacity>
        </View>

        {erreur ? (
          <View style={styles.erreurContainer}>
            <Text style={styles.erreurTexte}>Erreur: {erreur}</Text>
            <TouchableOpacity style={styles.boutonRetry} onPress={chargerHistorique}>
              <Text style={styles.boutonRetryTexte}>Reessayer</Text>
            </TouchableOpacity>
          </View>
        ) : courses.length === 0 ? (
          <View style={styles.vide}>
            <Text style={styles.videEmoji}>🚗</Text>
            <Text style={styles.videTexte}>Aucune course</Text>
            <TouchableOpacity style={styles.boutonRetry} onPress={chargerHistorique}>
              <Text style={styles.boutonRetryTexte}>Actualiser</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={courses}
            keyExtractor={item => item.id}
            renderItem={({item}) => (
              <View style={styles.courseCard}>
                <View style={styles.courseHeader}>
                  <Text style={styles.courseDestination}>
                    {item.destinationNom || 'Destination inconnue'}
                  </Text>
                  <Text style={[styles.courseStatut, {color: getStatutColor(item.statut)}]}>
                    {item.statut}
                  </Text>
                </View>
                <View style={styles.courseDetails}>
                  <Text style={styles.courseDetail}>
                    {item.tarif} FCFA
                  </Text>
                  <Text style={styles.courseDetail}>
                    {item.distance} km
                  </Text>
                  <Text style={styles.courseDetail}>
                    {item.modeVehicule || 'standard'}
                  </Text>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#1a1a2e'},
  container: {flex: 1, padding: 20},
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  loadingTexte: {color: '#fff', marginTop: 16},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 10,
  },
  retour: {color: '#00b4d8', fontSize: 16},
  titre: {fontSize: 20, fontWeight: 'bold', color: '#fff'},
  recharger: {color: '#00b4d8', fontSize: 14},
  erreurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  erreurTexte: {color: '#cc0000', fontSize: 14, textAlign: 'center', marginBottom: 16},
  vide: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  videEmoji: {fontSize: 60, marginBottom: 16},
  videTexte: {color: '#888', fontSize: 16, marginBottom: 16},
  boutonRetry: {
    backgroundColor: '#00b4d8',
    borderRadius: 10,
    padding: 12,
    paddingHorizontal: 24,
  },
  boutonRetryTexte: {color: '#fff', fontSize: 14, fontWeight: 'bold'},
  courseCard: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  courseDestination: {color: '#fff', fontSize: 15, fontWeight: 'bold', flex: 1},
  courseStatut: {fontSize: 13, fontWeight: 'bold'},
  courseDetails: {flexDirection: 'row', justifyContent: 'space-between'},
  courseDetail: {color: '#aaa', fontSize: 13},
});