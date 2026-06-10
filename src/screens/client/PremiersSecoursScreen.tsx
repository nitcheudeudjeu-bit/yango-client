import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

const CONSEILS_SECOURS: any = {
  accident: {
    titre: 'Accident de voiture',
    emoji: '🚗',
    conseils: [
      'Securiser la zone - allumer les feux de detresse',
      'Appeler le 15 (SAMU) ou 18 (Pompiers)',
      'Ne pas deplacer les blesses sauf danger immediat',
      'Parler a la victime pour la rassurer',
      'Verifier la respiration et le pouls',
      'Si inconscient - position laterale de securite',
      'Arreter les hemorragies avec compression',
    ],
  },
  incendie: {
    titre: 'Incendie',
    emoji: '🔥',
    conseils: [
      'Appeler le 18 (Pompiers) immediatement',
      'Evacuer les personnes en danger',
      'Fermer les portes pour ralentir le feu',
      'Se baisser pour eviter la fumee',
      'Ne jamais utiliser les ascenseurs',
      'Se rassembler au point de rassemblement',
      'Ne pas revenir chercher des objets',
    ],
  },
  agression: {
    titre: 'Agression / Violence',
    emoji: '🆘',
    conseils: [
      'Appeler le 17 (Police) immediatement',
      'Mettre vous en securite si possible',
      'Ne pas confronter lagresseur',
      'Observer et memoriser les details',
      'Aider les victimes apres securisation',
      'Preserver les preuves',
      'Temoigner aupres des autorites',
    ],
  },
  malaise: {
    titre: 'Malaise / Maladie',
    emoji: '😰',
    conseils: [
      'Appeler le 15 (SAMU)',
      'Allonger la victime',
      'Desserrer les vetements',
      'Ne rien donner a boire ou manger',
      'Verifier la conscience et la respiration',
      'Si arret cardiaque - massage cardiaque',
      'Parler calmement a la victime',
    ],
  },
  noyade: {
    titre: 'Noyade',
    emoji: '🌊',
    conseils: [
      'Appeler le 15 (SAMU) ou 18',
      'Ne pas plonger sauf si entrainer',
      'Lancer une bouee ou corde',
      'Sortir la victime de leau',
      'Verifier la respiration',
      'Pratiquer le bouche a bouche si necessaire',
      'Couvrir la victime contre hypothermie',
    ],
  },
  chute: {
    titre: 'Chute / Traumatisme',
    emoji: '🤕',
    conseils: [
      'Ne pas deplacer la victime',
      'Appeler le 15 (SAMU)',
      'Immobiliser la tete et le cou',
      'Arreter les saignements',
      'Surveiller la conscience',
      'Couvrir la victime',
      'Rassurer et parler a la victime',
    ],
  },
};

const MOTS_CLES: any = {
  accident: ['accident', 'voiture', 'collision', 'choc', 'vehicule', 'moto'],
  incendie: ['feu', 'incendie', 'flamme', 'brule', 'fumee', 'explosion'],
  agression: ['agression', 'violence', 'attaque', 'vol', 'bagarre', 'arme'],
  malaise: ['malaise', 'inconscient', 'coeur', 'respiration', 'evanoui', 'crise'],
  noyade: ['noyade', 'eau', 'noye', 'riviere', 'piscine', 'mer'],
  chute: ['chute', 'tombe', 'blesse', 'fracture', 'blessure', 'traumatisme'],
};

export default function PremiersSecoursScreen({navigation}: any) {
  const [description, setDescription] = useState('');
  const [conseils, setConseils] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const analyserSituation = () => {
    if (!description.trim()) {return;}
    setLoading(true);

    setTimeout(() => {
      const descLower = description.toLowerCase();
      let typeDetecte = null;
      let scoreMax = 0;

      Object.keys(MOTS_CLES).forEach(type => {
        const mots = MOTS_CLES[type];
        let score = 0;
        mots.forEach((mot: string) => {
          if (descLower.includes(mot)) {score++;}
        });
        if (score > scoreMax) {
          scoreMax = score;
          typeDetecte = type;
        }
      });

      if (typeDetecte && scoreMax > 0) {
        setConseils(CONSEILS_SECOURS[typeDetecte]);
      } else {
        setConseils({
          titre: 'Conseils generaux',
          emoji: '🆘',
          conseils: [
            'Appeler le 15 (SAMU) ou 18 (Pompiers)',
            'Securiser la zone',
            'Ne pas deplacer les blesses',
            'Rassurer les victimes',
            'Attendre les secours',
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
          <Text style={styles.titre}>Premiers secours</Text>
        </View>

        <Text style={styles.sousTitre}>
          Decrivez la situation en quelques mots pour obtenir les conseils
          adaptes
        </Text>

        <View style={styles.exemples}>
          <Text style={styles.exemplesTitle}>Exemples :</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {Object.keys(CONSEILS_SECOURS).map(type => (
              <TouchableOpacity
                key={type}
                style={styles.exempleBtn}
                onPress={() => {
                  setDescription(type);
                  setConseils(CONSEILS_SECOURS[type]);
                }}>
                <Text style={styles.exempleTexte}>
                  {CONSEILS_SECOURS[type].emoji} {CONSEILS_SECOURS[type].titre}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Ex: accident de voiture, incendie, malaise..."
          placeholderTextColor="#888"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity
          style={styles.boutonAnalyser}
          onPress={analyserSituation}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.texteBouton}>Analyser et obtenir conseils</Text>
          )}
        </TouchableOpacity>

        {conseils && (
          <View style={styles.conseilsContainer}>
            <Text style={styles.conseilsTitre}>
              {conseils.emoji} {conseils.titre}
            </Text>
            {conseils.conseils.map((conseil: string, index: number) => (
              <View key={index} style={styles.conseilRow}>
                <Text style={styles.conseilNumero}>{index + 1}</Text>
                <Text style={styles.conseilTexte}>{conseil}</Text>
              </View>
            ))}

            <TouchableOpacity
              style={styles.boutonCarte}
              onPress={() => navigation.navigate('SecoursMap')}>
              <Text style={styles.texteBouton}>
                Voir secours proches sur la carte
              </Text>
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
    marginBottom: 16,
    marginTop: 10,
  },
  retour: {color: '#00b4d8', fontSize: 16, marginRight: 15},
  titre: {fontSize: 22, fontWeight: 'bold', color: '#fff'},
  sousTitre: {
    fontSize: 13,
    color: '#888',
    marginBottom: 16,
    lineHeight: 20,
  },
  exemples: {marginBottom: 16},
  exemplesTitle: {color: '#aaa', fontSize: 13, marginBottom: 8},
  exempleBtn: {
    backgroundColor: '#16213e',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  exempleTexte: {color: '#fff', fontSize: 12},
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
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  texteBouton: {color: '#fff', fontSize: 15, fontWeight: 'bold'},
  conseilsContainer: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  conseilsTitre: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  conseilRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  conseilNumero: {
    backgroundColor: '#cc0000',
    color: '#fff',
    width: 26,
    height: 26,
    borderRadius: 13,
    textAlign: 'center',
    lineHeight: 26,
    fontSize: 13,
    fontWeight: 'bold',
    marginRight: 12,
  },
  conseilTexte: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
    lineHeight: 22,
  },
  boutonCarte: {
    backgroundColor: '#cc0000',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 16,
  },
});