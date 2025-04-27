import { Injectable, NgZone, inject } from '@angular/core';
import {
  Firestore,
  collection,
  onSnapshot,
  setDoc,
  getDocs,
  doc,
  deleteDoc,
} from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  // private firestore = inject(Firestore);
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
        msg.includes('Firebase API called outside injection context: getDocs')
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
        userData['fireId'] = doc.id; // Fügen Sie die ID des Dokuments hinzu
        // console.log('User-Objekt nach map():', userData); // Check
        return userData;
      });
      // console.log('Gesammelte Users:', users); // Debugging
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

  // private subscribeToMessages() {
  //   const channelsRef = collection(this.firestore, "channels");
  //   onSnapshot(channelsRef, (channelsSnapshot) => {
  //     let allMessages: any[] = [];

  //     // Durchlaufe alle Channels und hole die Nachrichten
  //     channelsSnapshot.docs.forEach((channelDoc) => {
  //       const messagesRef = collection(channelDoc.ref, "messages");
  //       onSnapshot(messagesRef, (messagesSnapshot) => {
  //         // Sammle alle Nachrichten in diesem Channel
  //         const channelMessages = messagesSnapshot.docs.map(messageDoc => ({
  //           id: messageDoc.id,
  //           ...messageDoc.data()
  //         }));

  //         // Füge die Nachrichten des aktuellen Channels zu allMessages hinzu
  //         allMessages = [...allMessages, ...channelMessages];

  //         // Update das BehaviorSubject mit den neuen Nachrichten
  //         this.messagesSubject.next(allMessages);
  //       });
  //     });
  //   });
  // }

  //   async getAllMessages(): Promise<any[]> {
  //     const allMessages: any[] = [];

  //   //"channels" mit allen Unterdocumenten wird geladen
  //     const channelsRef = collection(this.firestore, "channels");
  //     const channelsSnapshot = await getDocs(channelsRef);
  //     // console.log(channelsSnapshot.docs.length, 'channels found');
  //     for (const channelDoc of channelsSnapshot.docs) {
  //       const messagesRef = collection(channelDoc.ref, "messsages");
  //       const messagesSnapshot = await getDocs(messagesRef);
  //       // console.log(messagesSnapshot.docs.length, 'messages found in channel', channelDoc.id);
  //       for (const messageDoc of messagesSnapshot.docs) {
  //         const messageData = messageDoc.data();
  //         messageData['id'] = messageDoc.id;
  //         allMessages.push(messageData);
  //         // console.log(messageData, 'message found in channel', channelDoc.id);
  //         const threadsRef = collection(messageDoc.ref, "thread");
  //         const threadsSnapshot = await getDocs(threadsRef);
  //         // console.log(threadsSnapshot.docs.length, 'threads found in message', messageDoc.id);
  //         for (const threadDoc of threadsSnapshot.docs) {
  //           const threadMessageData = threadDoc.data();
  //           threadMessageData['id'] = threadDoc.id;
  //           threadMessageData['parentMessageId'] = messageDoc.id; // Referenz zur ursprünglichen Nachricht
  //           allMessages.push(threadMessageData);
  //           // console.log(threadMessageData, 'thread message found in message', messageDoc.id);
  //         }
  //       }
  //     }

  // // "directMessages" mit allen Unterdocumenten wird geladen
  //     const directMessagesRef = collection(this.firestore, "directMessages");
  //     const messageSnapshot = await getDocs(directMessagesRef);
  //     // console.log(messageSnapshot.docs.length, 'direct messages found');
  //     for (const messageDoc of messageSnapshot.docs) {
  //       const messagesRef = collection(messageDoc.ref, "messages");
  //       const messagesSnapshot = await getDocs(messagesRef);
  //       // console.log(messagesSnapshot.docs.length, 'messages found in direct Message', messageDoc.id);
  //       for (const singleMessage of messagesSnapshot.docs) {
  //         const singleMessageData = singleMessage.data();
  //         // threadMessageData['id'] = threadDoc.id;
  //         // threadMessageData['parentMessageId'] = messageDoc.id;
  //         allMessages.push(singleMessageData);
  //     }
  //   }

  //     console.log('allMessages:', allMessages);

  //     return allMessages;
  //   }

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

        const threadsRef = collection(messageDoc.ref, 'replies');
        const threadsSnapshot = await getDocs(threadsRef);

        for (const threadDoc of threadsSnapshot.docs) {
          const threadData = {
            ...threadDoc.data(),
            id: threadDoc.id,
            parentMessageId: messageDoc.id,
            path: threadDoc.ref.path,
          };
          messages.push(threadData);
        }
      }
    }

    return messages;
  }

  private async getDirectMessages(): Promise<any[]> {
    const messages: any[] = [];
    this.ngZone.run(async () => {
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
    });

    return messages;
  }

  async getAllUsers(): Promise<any[]> {
    const allUsers: any[] = [];
    const usersRef = collection(this.firestore, 'users');
    const usersSnapshot = await getDocs(usersRef);
    // console.log(usersSnapshot.docs.length, 'users found');

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      userData['fireId'] = userDoc.id;
      allUsers.push(userData);
      // console.log(userData, 'user found');
    }
    return allUsers;
  }

  // async getAllChannels(): Promise<any[]> {
  //   const allChannels: any[] = [];
  //   const channelsRef = collection(this.firestore, "channels");
  //   const channelsSnapshot = await getDocs(channelsRef);
  //   // console.log(channelsSnapshot.docs.length, 'channels found');

  //   for (const channelDoc of channelsSnapshot.docs) {
  //     const channelData = channelDoc.data();
  //     channelData['id'] = channelDoc.id;
  //     allChannels.push(channelData);
  //     // console.log(channelData, 'channel found');
  //   }
  //   return allChannels;
  // }

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
    });
  }
}
