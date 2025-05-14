import { Injectable, NgZone } from '@angular/core';
import {
  Firestore,
  collection,
  onSnapshot,
  setDoc,
  getDocs,
  getDoc,
  doc,
  deleteDoc,
} from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private usersSubject = new BehaviorSubject<any[]>([]);
  private channelsSubject = new BehaviorSubject<any[]>([]);
  private messagesSubject = new BehaviorSubject<any[]>([]);
  private channelSource = new BehaviorSubject<{
    id: string;
    name: string;
  } | null>(null);

  currentChannel$ = this.channelSource.asObservable();
  users$ = this.usersSubject.asObservable();
  channels$ = this.channelsSubject.asObservable();
  messages$ = this.messagesSubject.asObservable();

  constructor(private firestore: Firestore, private ngZone: NgZone) {
    this.subscribeToUsers();
    this.subscribeToChannels();

    //WorkAround für Firebase-Warnung
    const originalWarn = console.warn;
    console.warn = (msg: string, ...args: any[]) => {
      if (
        msg.includes('Firebase')
      ) {
        return;
      }
      originalWarn(msg, ...args);
    };
    // this.subscribeToMessages();
  }

  private subscribeToUsers() {
    const usersRef = collection(this.firestore, 'users');
    onSnapshot(usersRef, (snapshot) => {
      const users = snapshot.docs.map((doc) => {
        const userData = doc.data();
        userData['fireId'] = doc.id;
        return userData;
      });
      this.usersSubject.next(users);
    });
  }

  private subscribeToChannels() {
    const channelsRef = collection(this.firestore, 'channels');
    onSnapshot(channelsRef, (snapshot) => {
      const channels = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      this.channelsSubject.next(channels);
    });
  }

  async updateMessages() {
    const allMessages = await this.getAllMessages();
    this.messagesSubject.next(allMessages);
  }

  async getAllMessages(): Promise<any[]> {
    const [channelMessages, directMessages] = await Promise.all([
      this.getMessagesFromChannels(),
      this.getDirectMessages(),
    ]);

    const allMessages = [...channelMessages, ...directMessages];
    // console.log('allMessages:', allMessages);
    return allMessages;
  }

  private async getMessagesFromChannels(): Promise<any[]> {
    const messages: any[] = [];
    const channelsRef = collection(this.firestore, 'channels');
    const channelsSnapshot = await getDocs(channelsRef);

    for (const channelDoc of channelsSnapshot.docs) {
      const messagesRef = collection(channelDoc.ref, 'messages');
      const messagesSnapshot = await getDocs(messagesRef);

      for (const messageDoc of messagesSnapshot.docs) {
        const messageData = {
          ...messageDoc.data(),
          id: messageDoc.id,
          path: messageDoc.ref.path,
        };

        messages.push(messageData);
      }
    }
    // console.log('Kanalanachrichten:', messages);

    return messages;
  }

  private async getDirectMessages(): Promise<any[]> {
    const messages: any[] = [];
      const directMessagesRef = collection(this.firestore, 'directMessages');
      const dmSnapshot = await getDocs(directMessagesRef);

      for (const messageDoc of dmSnapshot.docs) {
        const messagesRef = collection(messageDoc.ref, 'messages');
        const messagesSnapshot = await getDocs(messagesRef);

        for (const singleMessage of messagesSnapshot.docs) {
          const messageData = {
            ...singleMessage.data(),
            id: singleMessage.id,
            path: singleMessage.ref.path,
          };

          messages.push(messageData);
        }
      }
    return messages;
  }

  async getAllUsers(): Promise<any[]> {
    const allUsers: any[] = [];
    const usersRef = collection(this.firestore, 'users');
    const usersSnapshot = await getDocs(usersRef);

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      userData['fireId'] = userDoc.id;
      allUsers.push(userData);
    }

    return allUsers;
  }

  updateChannelMessageBox(channelId: string, channelName: string) {
    this.channelSource.next({ id: channelId, name: channelName });
  }

  // NEUE FUNKTION (EINZIGE ÄNDERUNG)
  async deleteMessage(channelId: string, messageId: string): Promise<void> {
    const messageRef = doc(
      this.firestore,
      `channels/${channelId}/messages/${messageId}`
    );
    await deleteDoc(messageRef);
  }

  async addNewUserFromGoogle(user: {
    fireId: string;
    email: string;
    name: string;
    picture: string;
    id: number
  }): Promise<void> {
    const usersRef = collection(this.firestore, 'users');
    const userDoc = doc(usersRef, user.fireId);
    await setDoc(userDoc, {
      email: user.email,
      name: user.name,
      picture: user.picture,
      online: true,
      status: 'online',
      fireId: user.fireId,
      id: user.id
    });
  }

  async loadSingleChatMesasage(channelID: string, messageId: string) {
    const ref = doc(
      this.firestore,
      'channels',
      channelID,
      'messages',
      messageId
    );
    const docSnap = await getDoc(ref);
    return docSnap.data();
  }

  async loadSingleUserData(fireId:string) {
    const ref = doc(this.firestore, 'users', fireId);
    const docSnap = await getDoc(ref);
    return docSnap.data();
  }

  async getChatParticipants(chatId: string) {
    try {
      const ref = doc(this.firestore, 'directMessages', chatId);
      const docSnap = await getDoc(ref);
      if (!docSnap.exists()) {
        console.warn(`Dokument mit der ID ${chatId} existiert nicht.`);
        return null;
      }
      return docSnap.data();
    } catch (error) {
      console.error('Fehler beim Abrufen der Chat-Teilnehmer:', error);
      return null;
    }
  }
}




