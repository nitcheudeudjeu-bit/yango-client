import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export default function ChatScreen({navigation, route}: any) {
  const {courseId, destinataireNom} = route.params || {};
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<any>(null);
  const user = auth().currentUser;

  useEffect(() => {
    if (!courseId) {
      setLoading(false);
      return;
    }
    const unsubscribe = firestore()
      .collection('chats')
      .doc(courseId)
      .collection('messages')
      .orderBy('createdAt', 'asc')
      .onSnapshot(
        snapshot => {
          const msgs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setMessages(msgs);
          setLoading(false);
        },
        error => {
          console.log('Erreur chat:', error);
          setLoading(false);
        },
      );
    return () => unsubscribe();
  }, [courseId]);

  const envoyerMessage = async () => {
    if (!message.trim() || !courseId) {return;}
    const texte = message.trim();
    setMessage('');
    try {
      await firestore()
        .collection('chats')
        .doc(courseId)
        .collection('messages')
        .add({
          texte,
          senderId: user?.uid,
          senderEmail: user?.email,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
      console.log('Erreur envoi:', error);
    }
  };

  const renderMessage = ({item}: any) => {
    const estMoi = item.senderId === user?.uid;
    return (
      <View
        style={[
          styles.messageContainer,
          estMoi ? styles.messageMoi : styles.messageAutre,
        ]}>
        <Text style={styles.messageTexte}>{item.texte}</Text>
        <Text style={styles.messageHeure}>
          {item.createdAt?.toDate
            ? item.createdAt.toDate().toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              })
            : ''}
        </Text>
      </View>
    );
  };

  if (!courseId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.retour}>Retour</Text>
            </TouchableOpacity>
            <Text style={styles.titre}>Chat</Text>
          </View>
          <View style={styles.vide}>
            <Text style={styles.videEmoji}>💬</Text>
            <Text style={styles.videTexte}>Aucune course active</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#00b4d8" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.retour}>Retour</Text>
          </TouchableOpacity>
          <Text style={styles.titre}>
            {destinataireNom || 'Chat'}
          </Text>
        </View>

        {messages.length === 0 ? (
          <View style={styles.vide}>
            <Text style={styles.videEmoji}>💬</Text>
            <Text style={styles.videTexte}>Aucun message</Text>
            <Text style={styles.videsSousTitre}>
              Envoyez un message
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({animated: true})
            }
          />
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Ecrire un message..."
            placeholderTextColor="#888"
            multiline
          />
          <TouchableOpacity
            style={[
              styles.boutonEnvoyer,
              !message.trim() && styles.boutonEnvoyerDisabled,
            ]}
            onPress={envoyerMessage}
            disabled={!message.trim()}>
            <Text style={styles.envoyer}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#1a1a2e'},
  container: {flex: 1},
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  retour: {color: '#00b4d8', fontSize: 16, marginRight: 15},
  titre: {fontSize: 18, fontWeight: 'bold', color: '#fff'},
  vide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  videEmoji: {fontSize: 60, marginBottom: 16},
  videTexte: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  videsSousTitre: {color: '#888', fontSize: 14, textAlign: 'center'},
  messagesList: {padding: 16},
  messageContainer: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
  },
  messageMoi: {
    backgroundColor: '#00b4d8',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  messageAutre: {
    backgroundColor: '#16213e',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageTexte: {color: '#fff', fontSize: 15},
  messageHeure: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#16213e',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 15,
    marginRight: 8,
    maxHeight: 100,
  },
  boutonEnvoyer: {
    backgroundColor: '#00b4d8',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boutonEnvoyerDisabled: {
    backgroundColor: '#333',
  },
  envoyer: {color: '#fff', fontSize: 18},
});