import { Injectable, inject } from '@angular/core';
import { Firestore, collection, onSnapshot, getDocs } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private firestore = inject(Firestore);
  private usersSubject = new BehaviorSubject<any[]>([]);
  private channelsSubject = new BehaviorSubject<any[]>([]);
  private messagesSubject = new BehaviorSubject<any[]>([]);
  private channelSource = new BehaviorSubject<{ id: string, name: string } | null>(null);

  currentChannel$ = this.channelSource.asObservable();
  users$ = this.usersSubject.asObservable();
  channels$ = this.channelsSubject.asObservable();
  messages$ = this.messagesSubject.asObservable();

  constructor() {
    this.subscribeToUsers();
    this.subscribeToChannels();
    // this.subscribeToMessages();
  }

  private subscribeToUsers() {
    const usersRef = collection(this.firestore, "users");
    onSnapshot(usersRef, (snapshot) => {
      const users = snapshot.docs.map(doc => {
        const userData = doc.data();
        userData['fireId'] = doc.id; // Fügen Sie die ID des Dokuments hinzu
        console.log('User-Objekt nach map():', userData); // Check
        return userData;
      });
      console.log('Gesammelte Users:', users); // Debugging
    this.usersSubject.next(users);
  });
  }

  private subscribeToChannels() {
    const channelsRef = collection(this.firestore, "channels");
    onSnapshot(channelsRef, (snapshot) => {
      const channels = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

  async getAllMessages(): Promise<any[]> {
    const allMessages: any[] = [];
    const channelsRef = collection(this.firestore, "channels");
    const channelsSnapshot = await getDocs(channelsRef);
    // console.log(channelsSnapshot.docs.length, 'channels found');

    for (const channelDoc of channelsSnapshot.docs) {
      const messagesRef = collection(channelDoc.ref, "messsages");
      const messagesSnapshot = await getDocs(messagesRef);
      // console.log(messagesSnapshot.docs.length, 'messages found in channel', channelDoc.id);

      for (const messageDoc of messagesSnapshot.docs) {
        const messageData = messageDoc.data();
        messageData['id'] = messageDoc.id;
        allMessages.push(messageData);
        // console.log(messageData, 'message found in channel', channelDoc.id);

        const threadsRef = collection(messageDoc.ref, "thread");
        const threadsSnapshot = await getDocs(threadsRef);
        // console.log(threadsSnapshot.docs.length, 'threads found in message', messageDoc.id);

        for (const threadDoc of threadsSnapshot.docs) {
          const threadMessageData = threadDoc.data();
          threadMessageData['id'] = threadDoc.id;
          threadMessageData['parentMessageId'] = messageDoc.id; // Referenz zur ursprünglichen Nachricht
          allMessages.push(threadMessageData);
          // console.log(threadMessageData, 'thread message found in message', messageDoc.id);
        }
      }
    }
    return allMessages;
  }

  // async getAllUsers(): Promise<any[]> {
  //   const allUsers: any[] = [];
  //   const usersRef = collection(this.firestore, "users");
  //   const usersSnapshot = await getDocs(usersRef);
  //   // console.log(usersSnapshot.docs.length, 'users found');

  //   for (const userDoc of usersSnapshot.docs) {
  //     const userData = userDoc.data();
  //     userData['id'] = userDoc.id;
  //     allUsers.push(userData);
  //     // console.log(userData, 'user found');
  //   }
  //   return allUsers;
  // }

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
    this.channelSource.next({ id: channelId, name: channelName }); // Wert aktualisieren
  }

}
