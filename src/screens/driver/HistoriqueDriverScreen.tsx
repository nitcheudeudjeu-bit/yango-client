import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export default function HistoriqueDriverScreen({navigation}: any) {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [gains, setGains] = useState(0);

  useEffect(() => {
    chargerHistorique();
  }, []);

  const chargerHistorique = async () => {
  const user = auth().currentUser;
  if (!user) {return;}
  try {
    const snapshot = await firestore()
      .collection('courses')
      .where('chauffeurId', '==', user.uid)
      .get();
    const list = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    list.sort((a: any, b: any) => {
      if (!a.createdAt || !b.createdAt) {return 0;}
      return b.createdAt.seconds - a.createdAt.seconds;
    });
    setCourses(list);
    const totalGains = list
      .filter((c: any) => c.statut === 'terminee')
      .reduce((sum: number, c: any) => sum + (c.tarif || 0), 0);
    setGains(totalGains);
  } catch (error) {
    console.log('Erreur:', error);
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
          <Text style={styles.titre}>Mes courses</Text>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.stat}>
            <Text style={styles.statValeur}>{courses.length}</Text>
            <Text style={styles.statLabel}>Total courses</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValeur}>
              {courses.filter(c => c.statut === 'terminee').length}
            </Text>
            <Text style={styles.statLabel}>Terminees</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValeur, {color: '#00b4d8'}]}>
              {gains.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>FCFA gagnes</Text>
          </View>
        </View>

        {courses.length === 0 ? (
          <View style={styles.vide}>
            <Text style={styles.videEmoji}>🚗</Text>
            <Text style={styles.videTexte}>Aucune course pour l instant</Text>
          </View>
        ) : (
          <FlatList
            data={courses}
            keyExtractor={item => item.id}
            renderItem={({item}) => (
              <View style={styles.courseCard}>
                <View style={styles.courseHeader}>
                  <Text style={styles.courseDestination}>
                    {item.destinationNom}
                  </Text>
                  <Text
                    style={[
                      styles.courseStatut,
                      {color: getStatutColor(item.statut)},
                    ]}>
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
                    {item.createdAt?.toDate().toLocaleDateString('fr-FR')}
                  </Text>
                </View>
                {item.note && (
                  <Text style={styles.noteTexte}>
                    Note client : {item.note}/5
                  </Text>
                )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  retour: {color: '#00b4d8', fontSize: 16, marginRight: 15},
  titre: {fontSize: 22, fontWeight: 'bold', color: '#fff'},
  statsCard: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  stat: {alignItems: 'center'},
  statValeur: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {fontSize: 12, color: '#888'},
  vide: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  videEmoji: {fontSize: 60, marginBottom: 16},
  videTexte: {color: '#888', fontSize: 16},
  courseCard: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  courseDestination: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    flex: 1,
  },
  courseStatut: {fontSize: 13, fontWeight: 'bold'},
  courseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  courseDetail: {color: '#aaa', fontSize: 13},
  noteTexte: {color: '#FFD700', fontSize: 13, marginTop: 8},
});