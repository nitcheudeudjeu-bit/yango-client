import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import auth from '@react-native-firebase/auth';
import {ActivityIndicator, View} from 'react-native';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ClientHomeScreen from '../screens/client/ClientHomeScreen';
import ClientMapScreen from '../screens/client/ClientMapScreen';
import BookingScreen from '../screens/client/BookingScreen';
import HistoriqueScreen from '../screens/client/HistoriqueScreen';
import EvaluationScreen from '../screens/client/EvaluationScreen';
import SOSScreen from '../screens/client/SOSScreen';
import CameraScreen from '../screens/client/CameraScreen';
import SecoursMapScreen from '../screens/client/SecoursMapScreen';
import PremiersSecoursScreen from '../screens/client/PremiersSecoursScreen';
import SuiviCourseScreen from '../screens/client/SuiviCourseScreen';
import ProfilScreen from '../screens/client/ProfilScreen';
import PaiementScreen from '../screens/client/PaiementScreen';
import ReservationScreen from '../screens/client/ReservationScreen';
import ChatScreen from '../screens/client/ChatScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(currentUser => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e'}}>
        <ActivityIndicator size="large" color="#00b4d8" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="ClientHome" component={ClientHomeScreen} />
            <Stack.Screen name="ClientMap" component={ClientMapScreen} />
            <Stack.Screen name="Booking" component={BookingScreen} />
            <Stack.Screen name="SuiviCourse" component={SuiviCourseScreen} />
            <Stack.Screen name="Historique" component={HistoriqueScreen} />
            <Stack.Screen name="Evaluation" component={EvaluationScreen} />
            <Stack.Screen name="Paiement" component={PaiementScreen} />
            <Stack.Screen name="Profil" component={ProfilScreen} />
            <Stack.Screen name="Reservation" component={ReservationScreen} />
            <Stack.Screen name="SOS" component={SOSScreen} />
            <Stack.Screen name="Camera" component={CameraScreen} />
            <Stack.Screen name="SecoursMap" component={SecoursMapScreen} />
            <Stack.Screen name="PremierSecours" component={PremiersSecoursScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}