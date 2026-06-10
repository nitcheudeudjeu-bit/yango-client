import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import auth from '@react-native-firebase/auth';

export default function ClientHomeScreen({navigation}: any) {
  const handleLogout = async () => {
    await auth().signOut();
    navigation.replace('Login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.titre}>Yango</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Profil')}
              style={styles.profilBtn}>
              <Text style={styles.profilEmoji}>👤</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout}>
              <Text style={styles.deconnexion}>Deconnexion</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bienvenue}>
          <Text style={styles.emoji}>🚕</Text>
          <Text style={styles.bienvenueTexte}>Bienvenue !</Text>
          <Text style={styles.sousTitre}>
            Ou voulez-vous aller aujourd hui ?
          </Text>
        </View>

        <TouchableOpacity
          style={styles.boutonCourse}
          onPress={() => navigation.navigate('Booking')}>
          <Text style={styles.texteBouton}>Commander une course</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.boutonSecondaire}
          onPress={() => navigation.navigate('Reservation')}>
          <Text style={styles.texteBoutonSecondaire}>Reserver a l avance</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.boutonSecondaire}
          onPress={() => navigation.navigate('Historique')}>
          <Text style={styles.texteBoutonSecondaire}>Historique des courses</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.boutonSecondaire}
          onPress={() => navigation.navigate('Paiement', {courseId: '', tarif: 0})}>
          <Text style={styles.texteBoutonSecondaire}>Paiement</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.boutonSecondaire}
          onPress={() => navigation.navigate('Evaluation', {})}>
          <Text style={styles.texteBoutonSecondaire}>Evaluer un chauffeur</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.boutonSecondaire}
          onPress={() => navigation.navigate('Profil')}>
          <Text style={styles.texteBoutonSecondaire}>Mon profil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.boutonSOS}
          onPress={() => navigation.navigate('SOS')}>
          <Text style={styles.texteBoutonSOS}> ESEQUIEL / SOS </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#1a1a2e'},
  container: {flexGrow: 1, padding: 24},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  headerActions: {flexDirection: 'row', alignItems: 'center'},
  profilBtn: {marginRight: 16},
  profilEmoji: {fontSize: 24},
  titre: {fontSize: 24, fontWeight: 'bold', color: '#00b4d8'},
  deconnexion: {color: '#888', fontSize: 14},
  bienvenue: {alignItems: 'center', marginBottom: 30},
  emoji: {fontSize: 60, marginBottom: 16},
  bienvenueTexte: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  sousTitre: {fontSize: 14, color: '#888', textAlign: 'center'},
  boutonCourse: {
    backgroundColor: '#00b4d8',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  boutonSecondaire: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  boutonSOS: {
    backgroundColor: '#cc0000',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#ff0000',
  },
  texteBouton: {color: '#fff', fontSize: 16, fontWeight: 'bold'},
  texteBoutonSecondaire: {color: '#aaa', fontSize: 15, fontWeight: 'bold'},
  texteBoutonSOS: {color: '#fff', fontSize: 16, fontWeight: 'bold'},
});