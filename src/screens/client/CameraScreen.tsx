import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {launchCamera} from 'react-native-image-picker';

const ANALYSES: any = {
  accident: {
    titre: 'Accident detecte',
    emoji: '🚗',
    conseils: [
      'Securiser la zone immediatement',
      'Appeler le 15 (SAMU)',
      'Ne pas deplacer les victimes',
      'Couper le moteur des vehicules',
      'Prendre photos pour assurance',
    ],
  },
  incendie: {
    titre: 'Incendie detecte',
    emoji: '🔥',
    conseils: [
      'Appeler le 18 (Pompiers)',
      'Evacuer la zone',
      'Ne pas utiliser eau sur feu electrique',
      'Se baisser sous la fumee',
    ],
  },
  agression: {
    titre: 'Agression detectee',
    emoji: '🆘',
    conseils: [
      'Appeler le 17 (Police)',
      'Ne pas intervenir seul',
      'Memoriser description agresseur',
      'Rester en securite',
    ],
  },
  blessure: {
    titre: 'Blessure detectee',
    emoji: '🤕',
    conseils: [
      'Appeler le 15 (SAMU)',
      'Comprimer la blessure',
      'Ne pas retirer objet plante',
      'Garder victime allongee',
    ],
  },
};

export default function CameraScreen({navigation}: any) {
  const [videoFilmee, setVideoFilmee] = useState(false);
  const [description, setDescription] = useState('');
  const [analyse, setAnalyse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const ouvrirCamera = async () => {
    const options: any = {
      mediaType: 'video',
      videoQuality: 'high',
      durationLimit: 300,
      saveToPhotos: true,
    };

    launchCamera(options, response => {
      if (response.didCancel) {return;}
      if (response.errorCode) {
        Alert.alert('Erreur', 'Impossible ouvrir la camera');
        return;
      }
      if (response.assets && response.assets[0]) {
        setVideoFilmee(true);
        Alert.alert(
          'Video sauvegardee',
          'Decrivez maintenant ce que vous avez filme pour obtenir les conseils adaptes',
        );
      }
    });
  };

  const analyserScene = () => {
    if (!description.trim()) {
      Alert.alert('Erreur', 'Veuillez decrire la scene observee');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const descLower = description.toLowerCase();
      let typeDetecte = null;
      let scoreMax = 0;

      const motsKeys: any = {
        accident: ['accident', 'voiture', 'collision', 'choc', 'vehicule', 'renverse'],
        incendie: ['feu', 'incendie', 'flamme', 'brule', 'fumee', 'explosion'],
        agression: ['agression', 'violence', 'attaque', 'vol', 'bagarre', 'arme', 'menace'],
        blessure: ['blesse', 'sang', 'fracture', 'chute', 'tombe', 'inconscient', 'blessure'],
      };

      Object.keys(motsKeys).forEach(type => {
        let score = 0;
        motsKeys[type].forEach((mot: string) => {
          if (descLower.includes(mot)) {score++;}
        });
        if (score > scoreMax) {
          scoreMax = score;
          typeDetecte = type;
        }
      });

      if (typeDetecte && scoreMax > 0) {
        setAnalyse(ANALYSES[typeDetecte]);
      } else {
        setAnalyse({
          titre: 'Situation d urgence',
          emoji: '🆘',
          conseils: [
            'Appeler le 15 ou 18',
            'Securiser la zone',
            'Attendre les secours',
            'Ne pas quitter les lieux',
          ],
        });
      }
      setLoading(false);
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.retour}>Retour</Text>
          </TouchableOpacity>
          <Text style={styles.titre}>Camera Securite</Text>
        </View>

        <TouchableOpacity style={styles.boutonCamera} onPress={ouvrirCamera}>
          <Text style={styles.cameraEmoji}>📹</Text>
          <Text style={styles.cameraTexte}>
            {videoFilmee ? 'Filmer a nouveau' : 'Filmer la scene'}
          </Text>
        </TouchableOpacity>

        {videoFilmee && (
          <>
            <Text style={styles.label}>
              Decrivez ce que vous avez observe :
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: accident de voiture, personne blessee, incendie..."
              placeholderTextColor="#888"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={styles.boutonAnalyser}
              onPress={analyserScene}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.texteBouton}>Analyser la scene</Text>
              )}
            </TouchableOpacity>
          </>
        )}

        {analyse && (
          <View style={styles.analyseContainer}>
            <Text style={styles.analyseEmoji}>{analyse.emoji}</Text>
            <Text style={styles.analyseTitre}>{analyse.titre}</Text>
            <Text style={styles.conseilsTitre}>Conseils immediats :</Text>
            {analyse.conseils.map((conseil: string, index: number) => (
              <View key={index} style={styles.conseilRow}>
                <Text style={styles.conseilNumero}>{index + 1}</Text>
                <Text style={styles.conseilTexte}>{conseil}</Text>
              </View>
            ))}
            <TouchableOpacity
              style={styles.boutonSecours}
              onPress={() => navigation.navigate('SecoursMap')}>
              <Text style={styles.texteBouton}>Voir secours proches</Text>
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
  titre: {fontSize: 22, fontWeight: 'bold', color: '#fff'},
  boutonCamera: {
    backgroundColor: '#cc0000',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  cameraEmoji: {fontSize: 50, marginBottom: 8},
  cameraTexte: {color: '#fff', fontSize: 16, fontWeight: 'bold'},
  label: {color: '#aaa', fontSize: 14, marginBottom: 8},
  input: {
    backgroundColor: '#16213e',
    borderRadius: 10,
    padding: 15,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  boutonAnalyser: {
    backgroundColor: '#00b4d8',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  boutonSecours: {
    backgroundColor: '#cc0000',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  texteBouton: {color: '#fff', fontSize: 15, fontWeight: 'bold'},
  analyseContainer: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 20,
  },
  analyseEmoji: {fontSize: 50, textAlign: 'center', marginBottom: 8},
  analyseTitre: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  conseilsTitre: {
    color: '#00b4d8',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  conseilRow: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  conseilNumero: {
    backgroundColor: '#cc0000',
    color: '#fff',
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 10,
  },
  conseilTexte: {color: '#fff', fontSize: 14, flex: 1, lineHeight: 20},
});