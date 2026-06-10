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
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export default function EvaluationScreen({navigation, route}: any) {
  const {courseId, chauffeurId} = route.params || {};
  const [note, setNote] = useState(0);
  const [commentaire, setCommentaire] = useState('');
  const [loading, setLoading] = useState(false);

  const envoyerEvaluation = async () => {
    if (note === 0) {
      Alert.alert('Erreur', 'Veuillez donner une note');
      return;
    }
    setLoading(true);
    try {
      const user = auth().currentUser;
      await firestore().collection('evaluations').add({
        courseId,
        chauffeurId,
        clientId: user?.uid,
        note,
        commentaire,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      await firestore()
        .collection('courses')
        .doc(courseId)
        .update({note, commentaire});

      setLoading(false);
      Alert.alert('Merci !', 'Votre évaluation a été envoyée', [
        {text: 'OK', onPress: () => navigation.navigate('ClientHome')},
      ]);
    } catch (error) {
      setLoading(false);
      Alert.alert('Erreur', "Impossible d'envoyer l'évaluation");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.emoji}>⭐</Text>
        <Text style={styles.titre}>Évaluer le chauffeur</Text>
        <Text style={styles.sousTitre}>
          Comment s'est passée votre course ?
        </Text>

        <View style={styles.etoilesContainer}>
          {[1, 2, 3, 4, 5].map(etoile => (
            <TouchableOpacity
              key={etoile}
              onPress={() => setNote(etoile)}>
              <Text style={[
                styles.etoile,
                {color: etoile <= note ? '#FFD700' : '#333'},
              ]}>
                ★
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.noteTexte}>
          {note === 0 ? 'Appuyez sur une étoile' :
           note === 1 ? '😞 Très mauvais' :
           note === 2 ? '😐 Mauvais' :
           note === 3 ? '🙂 Bien' :
           note === 4 ? '😊 Très bien' :
           '🤩 Excellent !'}
        </Text>

        <Text style={styles.label}>Commentaire (optionnel)</Text>
        <TextInput
          style={styles.input}
          placeholder="Laissez un commentaire..."
          placeholderTextColor="#888"
          value={commentaire}
          onChangeText={setCommentaire}
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity
          style={styles.bouton}
          onPress={envoyerEvaluation}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.texteBouton}>Envoyer l'évaluation</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.boutonIgnorer}
          onPress={() => navigation.navigate('ClientHome')}>
          <Text style={styles.texteIgnorer}>Ignorer</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  titre: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  sousTitre: {
    fontSize: 14,
    color: '#888',
    marginBottom: 30,
    textAlign: 'center',
  },
  etoilesContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  etoile: {
    fontSize: 50,
    marginHorizontal: 8,
  },
  noteTexte: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 24,
  },
  label: {
    color: '#aaa',
    fontSize: 13,
    marginBottom: 8,
    alignSelf: 'flex-start',
    width: '100%',
  },
  input: {
    backgroundColor: '#16213e',
    borderRadius: 10,
    padding: 15,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#333',
    width: '100%',
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  bouton: {
    backgroundColor: '#00b4d8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  texteBouton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  boutonIgnorer: {
    padding: 10,
  },
  texteIgnorer: {
    color: '#888',
    fontSize: 14,
  },
});