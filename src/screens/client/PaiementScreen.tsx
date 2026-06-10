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

const METHODES_PAIEMENT = [
  {id: 'mtn', nom: 'MTN Mobile Money', emoji: '📱', couleur: '#FFD700'},
  {id: 'orange', nom: 'Orange Money', emoji: '🟠', couleur: '#FF6600'},
  {id: 'cash', nom: 'Paiement cash', emoji: '💵', couleur: '#4CAF50'},
];

export default function PaiementScreen({navigation, route}: any) {
  const {courseId, tarif} = route.params || {};
  const [methode, setMethode] = useState('');
  const [numero, setNumero] = useState('');
  const [loading, setLoading] = useState(false);

  const confirmerPaiement = async () => {
    if (!methode) {
      Alert.alert('Erreur', 'Veuillez choisir une methode de paiement');
      return;
    }
    if (methode !== 'cash' && !numero) {
      Alert.alert('Erreur', 'Veuillez entrer votre numero');
      return;
    }
    setLoading(true);
    try {
      const user = auth().currentUser;
      await firestore().collection('paiements').add({
        courseId,
        clientId: user?.uid,
        montant: tarif,
        methode,
        numero: methode !== 'cash' ? numero : '',
        statut: methode === 'cash' ? 'en_attente' : 'initie',
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      await firestore().collection('courses').doc(courseId).update({
        paiementMethode: methode,
        paiementStatut: 'initie',
      });

      setLoading(false);
      Alert.alert(
        'Paiement initie',
        methode === 'cash'
          ? 'Payez le chauffeur en especes'
          : 'Confirmez le paiement sur votre telephone',
        [{text: 'OK', onPress: () => navigation.navigate('ClientHome')}],
      );
    } catch (error) {
      setLoading(false);
      Alert.alert('Erreur', 'Impossible de traiter le paiement');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.retour}>Retour</Text>
          </TouchableOpacity>
          <Text style={styles.titre}>Paiement</Text>
        </View>

        <View style={styles.montantCard}>
          <Text style={styles.montantLabel}>Montant a payer</Text>
          <Text style={styles.montant}>{tarif} FCFA</Text>
        </View>

        <Text style={styles.sectionTitre}>Choisir methode de paiement</Text>

        {METHODES_PAIEMENT.map(m => (
          <TouchableOpacity
            key={m.id}
            style={[
              styles.methodeCard,
              methode === m.id && styles.methodeCardActive,
            ]}
            onPress={() => setMethode(m.id)}>
            <Text style={styles.methodeEmoji}>{m.emoji}</Text>
            <Text style={styles.methodeNom}>{m.nom}</Text>
            {methode === m.id && (
              <Text style={styles.methodeCheck}>✓</Text>
            )}
          </TouchableOpacity>
        ))}

        {methode && methode !== 'cash' && (
          <>
            <Text style={styles.label}>Numero de telephone</Text>
            <TextInput
              style={styles.input}
              value={numero}
              onChangeText={setNumero}
              placeholder="+237 6XX XXX XXX"
              placeholderTextColor="#888"
              keyboardType="phone-pad"
            />
          </>
        )}

        <TouchableOpacity
          style={styles.boutonPayer}
          onPress={confirmerPaiement}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.texteBouton}>
              {methode === 'cash' ? 'Confirmer paiement cash' : 'Payer maintenant'}
            </Text>
          )}
        </TouchableOpacity>
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
    marginBottom: 24,
    marginTop: 10,
  },
  retour: {color: '#00b4d8', fontSize: 16, marginRight: 15},
  titre: {fontSize: 22, fontWeight: 'bold', color: '#fff'},
  montantCard: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  montantLabel: {color: '#888', fontSize: 14, marginBottom: 8},
  montant: {fontSize: 36, fontWeight: 'bold', color: '#00b4d8'},
  sectionTitre: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  methodeCard: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  methodeCardActive: {
    borderColor: '#00b4d8',
    backgroundColor: '#0d2137',
  },
  methodeEmoji: {fontSize: 24, marginRight: 12},
  methodeNom: {color: '#fff', fontSize: 15, flex: 1},
  methodeCheck: {color: '#00b4d8', fontSize: 20, fontWeight: 'bold'},
  label: {color: '#aaa', fontSize: 13, marginBottom: 6, marginTop: 12},
  input: {
    backgroundColor: '#16213e',
    borderRadius: 10,
    padding: 15,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 16,
  },
  boutonPayer: {
    backgroundColor: '#00b4d8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  texteBouton: {color: '#fff', fontSize: 16, fontWeight: 'bold'},
});