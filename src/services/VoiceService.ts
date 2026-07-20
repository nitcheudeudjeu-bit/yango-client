import Voice from '@react-native-voice/voice';

export const MOT_DECLENCHEUR = 'esequiel';

export const demarrerEcoute = (onSOSDetecte: () => void) => {
  Voice.onSpeechResults = (e: any) => {
    const texte = e.value?.[0]?.toLowerCase() || '';
    console.log('Texte detecte:', texte);
    if (texte.includes(MOT_DECLENCHEUR) ||
        texte.includes('esequiel') ||
        texte.includes('sos') ||
        texte.includes('urgence')) {
      onSOSDetecte();
    }
  };

  Voice.onSpeechError = (e: any) => {
    console.log('Erreur reconnaissance:', e);
    // Redemarrer l'ecoute en cas d'erreur
    setTimeout(() => {
      Voice.start('fr-FR');
    }, 1000);
  };

  Voice.start('fr-FR');
};

export const arreterEcoute = () => {
  Voice.stop();
  Voice.destroy();
};