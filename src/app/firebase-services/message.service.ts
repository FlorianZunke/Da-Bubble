import { Injectable, inject } from '@angular/core';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  private firestore = inject(Firestore);

  constructor() {}

  // async getAllMessages(): Promise<any[]> {
  //   const allMessages: any[] = [];
  //   const channelsRef = collection(this.firestore, "channels");
  //   const channelsSnapshot = await getDocs(channelsRef);
  //   console.log(channelsSnapshot.docs.length, 'channels found');


  //   for (const channelDoc of channelsSnapshot.docs) {
  //     const messagesRef = collection(channelDoc.ref, "messsages");
  //     const messagesSnapshot = await getDocs(messagesRef);
  //     console.log(messagesSnapshot.docs.length, 'messages found in channel', channelDoc.id);


  //     for (const messageDoc of messagesSnapshot.docs) {
  //       const messageData = messageDoc.data();
  //       allMessages.push(messageData);
  //       console.log(messageData, 'message found in channel', channelDoc.id);

  //     }
  //   }
  //   return allMessages;
  // }

  async getAllMessages(): Promise<any[]> {
    const allMessages: any[] = [];
    const channelsRef = collection(this.firestore, "channels");
    const channelsSnapshot = await getDocs(channelsRef);
    console.log(channelsSnapshot.docs.length, 'channels found');

    for (const channelDoc of channelsSnapshot.docs) {
      const messagesRef = collection(channelDoc.ref, "messsages");
      const messagesSnapshot = await getDocs(messagesRef);
      console.log(messagesSnapshot.docs.length, 'messages found in channel', channelDoc.id);

      for (const messageDoc of messagesSnapshot.docs) {
        const messageData = messageDoc.data();
        messageData['id'] = messageDoc.id;
        allMessages.push(messageData);
        console.log(messageData, 'message found in channel', channelDoc.id);

        const threadsRef = collection(messageDoc.ref, "thread");
        const threadsSnapshot = await getDocs(threadsRef);
        console.log(threadsSnapshot.docs.length, 'threads found in message', messageDoc.id);

        for (const threadDoc of threadsSnapshot.docs) {
          const threadMessageData = threadDoc.data();
          threadMessageData['id'] = threadDoc.id;
          threadMessageData['parentMessageId'] = messageDoc.id; // Referenz zur ursprünglichen Nachricht
          allMessages.push(threadMessageData);
          console.log(threadMessageData, 'thread message found in message', messageDoc.id);
        }
      }
    }
    return allMessages;
  }

  async getAllUsers(): Promise<any[]> {
    const allUsers: any[] = [];
    const usersRef = collection(this.firestore, "users");
    const usersSnapshot = await getDocs(usersRef);
    console.log(usersSnapshot.docs.length, 'users found');

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      userData['id'] = userDoc.id;
      allUsers.push(userData);
      console.log(userData, 'user found');
    }
    return allUsers;
  }
}
