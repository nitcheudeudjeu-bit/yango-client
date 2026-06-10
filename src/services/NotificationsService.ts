import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export const configurerNotifications = async () => {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    const token = await messaging().getToken();
    const user = auth().currentUser;
    if (user && token) {
      await firestore().collection('users').doc(user.uid).update({
        fcmToken: token,
      });
    }
  }
};

export const ecouterNotifications = () => {
  return messaging().onMessage(async remoteMessage => {
    console.log('Notification recue:', remoteMessage);
  });
};