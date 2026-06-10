import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {calculerTarifDynamique, getLibelleType} from '../../services/TarifService';

const HEURES = Array.from({length: 24}, (_, i) => {
  const h = i.toString().padStart(2, '0');
  return `${h}:00`;
});

const JOURS_SEMAINE = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

export default function ReservationScreen({navigation}: any) {
  const [destination, setDestination] = useState('');
  const [depart, setDepart] = useState('');
  const [dateSelectionnee, setDateSelectionnee] = useState('');
  const [heureSelectionnee, setHeureSelectionnee] = useState('');
  const [loading, setLoading] = useState(false);
  const [tarif, setTarif] = useState<any>(null);

  const getDatesDisponibles = () => {
    const dates = [];
    const maintenant = new Date();
    for (let i = 1; i <= 7; i++) {
      const date = new Date(maintenant);
      date.setDate(maintenant.getDate() + i);
      dates.push({
        date: date.toISOString().split('T')[0],
        label: `${JOURS_SEMAINE[date.getDay()]} ${date.getDate()}/${date.getMonth() + 1}`,
      });
    }
    return dates;
  };

  const calculerTarif = () => {
    if (!destination || !heureSelectionnee || !dateSelectionnee) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    const distanceEstimee = 5;
    const result = calculerTarifDynamique(distanceEstimee, 15);
    setTarif(result);
  };

  const confirmerReservation = async () => {
    if (!destination || !heureSelectionnee || !dateSelectionnee) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    if (!tarif) {
      Alert.alert('Erreur', 'Veuillez calculer le tarif d abord');
      return;
    }
    setLoading(true);
    try {
      const user = auth().currentUser;
      if (!user) {
        Alert.alert('Erreur', 'Utilisateur non connecte');
        setLoading(false);
        return;
      }

      await firestore().collection('reservations').add({
        clientId: user.uid,
        clientEmail: user.email,
        depart: depart || 'Position actuelle',
        destination,
        date: dateSelectionnee,
        heure: heureSelectionnee,
        tarif: tarif.tarif,
        typeTarif: tarif.typeHoraire,
        statut: 'en_attente',
        createdAt: new Date().toISOString(),
      });

      setLoading(false);
      Alert.alert(
        'Reservation confirmee !',
        `Course reservee pour le ${dateSelectionnee} a ${heureSelectionnee}`,
        [{text: 'OK', onPress: () => navigation.navigate('ClientHome')}],
      );
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Erreur', 'Impossible de confirmer: ' + error.message);
    }
  };

  const dates = getDatesDisponibles();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.retour}>Retour</Text>
          </TouchableOpacity>
          <Text style={styles.titre}>Reserver a l avance</Text>
        </View>

        <Text style={styles.label}>Point de depart (optionnel)</Text>
        <TextInput
          style={styles.input}
          value={depart}
          onChangeText={setDepart}
          placeholder="Votre position actuelle"
          placeholderTextColor="#888"
        />

        <Text style={styles.label}>Destination *</Text>
        <TextInput
          style={styles.input}
          value={destination}
          onChangeText={setDestination}
          placeholder="Ou voulez-vous aller ?"
          placeholderTextColor="#888"
        />

        <Text style={styles.label}>Choisir la date *</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.scroll}>
          {dates.map(d => (
            <TouchableOpacity
              key={d.date}
              style={[
                styles.dateBtn,
                dateSelectionnee === d.date && styles.dateBtnActive,
              ]}
              onPress={() => setDateSelectionnee(d.date)}>
              <Text style={[
                styles.dateBtnTexte,
                dateSelectionnee === d.date && styles.dateBtnTexteActive,
              ]}>
                {d.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Choisir l heure *</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.scroll}>
          {HEURES.map(h => (
            <TouchableOpacity
              key={h}
              style={[
                styles.heureBtn,
                heureSelectionnee === h && styles.heureBtnActive,
              ]}
              onPress={() => setHeureSelectionnee(h)}>
              <Text style={[
                styles.heureBtnTexte,
                heureSelectionnee === h && styles.heureBtnTexteActive,
              ]}>
                {h}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={styles.boutonCalculer}
          onPress={calculerTarif}>
          <Text style={styles.texteBouton}>Calculer le tarif</Text>
        </TouchableOpacity>

        {tarif && (
          <View style={styles.tarifCard}>
            <Text style={styles.tarifTitre}>Estimation</Text>
            <Text style={styles.tarifMontant}>{tarif.tarif} FCFA</Text>
            <Text style={styles.tarifType}>{getLibelleType(tarif.typeHoraire)}</Text>

            <TouchableOpacity
              style={styles.boutonConfirmer}
              onPress={confirmerReservation}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.texteBouton}>Confirmer la reservation</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
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
  titre: {fontSize: 20, fontWeight: 'bold', color: '#fff'},
  label: {color: '#aaa', fontSize: 13, marginBottom: 6, marginTop: 12},
  input: {
    backgroundColor: '#16213e',
    borderRadius: 10,
    padding: 15,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  scroll: {marginBottom: 8},
  dateBtn: {
    backgroundColor: '#16213e',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  dateBtnActive: {backgroundColor: '#00b4d8', borderColor: '#00b4d8'},
  dateBtnTexte: {color: '#888', fontSize: 13},
  dateBtnTexteActive: {color: '#fff', fontWeight: 'bold'},
  heureBtn: {
    backgroundColor: '#16213e',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  heureBtnActive: {backgroundColor: '#00b4d8', borderColor: '#00b4d8'},
  heureBtnTexte: {color: '#888', fontSize: 13},
  heureBtnTexteActive: {color: '#fff', fontWeight: 'bold'},
  boutonCalculer: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00b4d8',
    marginTop: 16,
    marginBottom: 16,
  },
  boutonConfirmer: {
    backgroundColor: '#00b4d8',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 16,
  },
  texteBouton: {color: '#fff', fontSize: 15, fontWeight: 'bold'},
  tarifCard: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  tarifTitre: {color: '#aaa', fontSize: 14, marginBottom: 8},
  tarifMontant: {
    color: '#00b4d8',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tarifType: {color: '#ff9800', fontSize: 13, marginBottom: 8},
});