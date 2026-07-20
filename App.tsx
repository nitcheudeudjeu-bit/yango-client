import React, {useEffect, useRef} from 'react';
import {Alert, Linking} from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import {demarrerEcoute, arreterEcoute} from './src/services/VoiceService';

export default function App() {
  const navigationRef = useRef<any>(null);

  useEffect(() => {
    // Démarrer l'écoute vocale au lancement
    demarrerEcoute(() => {
      Alert.alert(
        'SOS Detecte !',
        'Commande vocale "Esequiel" detectee !',
        [
          {
            text: 'Ouvrir SOS',
            onPress: () => {
              // Naviguer vers l'écran SOS
              if (navigationRef.current) {
                navigationRef.current.navigate('SOS');
              }
            },
          },
          {text: 'Annuler', style: 'cancel'},
        ],
      );
    });

    return () => {
      arreterEcoute();
    };
  }, []);

  return <AppNavigator ref={navigationRef} />;
}