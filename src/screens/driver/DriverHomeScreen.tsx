import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Switch,
  ScrollView,
} from 'react-native';
import auth from '@react-native-firebase/auth';

export default function DriverHomeScreen({navigation}: any) {
  const [disponible, setDisponible] = useState(false);

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
              onPress={() => navigation.navigate('ProfilDriver')}
              style={styles.profilBtn}>
              <Text style={styles.profilEmoji}>🚗</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout}>
              <Text style={styles.deconnexion}>Deconnexion</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bienvenue}>
          <Text style={styles.emoji}>🚗</Text>
          <Text style={styles.bienvenueTexte}>Bienvenue Chauffeur !</Text>
          <Text style={styles.sousTitre}>
            Activez votre disponibilite pour recevoir des courses
          </Text>
        </View>

        <View style={styles.disponibiliteContainer}>
          <Text style={styles.disponibiliteTexte}>
            {disponible ? 'Disponible' : 'Indisponible'}
          </Text>
          <Switch
            value={disponible}
            onValueChange={setDisponible}
            trackColor={{false: '#333', true: '#00b4d8'}}
            thumbColor={disponible ? '#fff' : '#888'}
          />
        </View>

        {disponible && (
          <TouchableOpacity
            style={styles.boutonCarte}
            onPress={() => navigation.navigate('DriverMap')}>
            <Text style={styles.texteBouton}>Voir la carte et les courses</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.boutonSecondaire}
          onPress={() => navigation.navigate('HistoriqueDriver')}>
          <Text style={styles.texteBoutonSecondaire}>Mes courses</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.boutonSecondaire}
          onPress={() => navigation.navigate('ProfilDriver')}>
          <Text style={styles.texteBoutonSecondaire}>Mon profil chauffeur</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.boutonSOS}
          onPress={() => navigation.navigate('SOS')}>
          <Text style={styles.texteBoutonSOS}>Urgence / SOS</Text>
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
    marginBottom: 40,
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
  disponibiliteContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  disponibiliteTexte: {fontSize: 18, fontWeight: 'bold', color: '#fff'},
  boutonCarte: {
    backgroundColor: '#00b4d8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
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