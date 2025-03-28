import { Injectable, inject } from '@angular/core';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  private firestore = inject(Firestore);

  constructor() {}

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
        allMessages.push(messageData);
        console.log(messageData, 'message found in channel', channelDoc.id);

      }
    }
    return allMessages;
  }
}
