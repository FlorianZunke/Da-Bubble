import { inject, Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { collection, addDoc, serverTimestamp, doc, getDoc, getDocs, onSnapshot, setDoc, query, where } from 'firebase/firestore';
import { Channel } from '../models/channel.class';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {
  private channelsSubject = new BehaviorSubject<any[]>([]); // Hier wird das Subject definiert
  channels$ = this.channelsSubject.asObservable(); // Observable für die Sidebar
  
  private currentChatSubject = new BehaviorSubject<{ type: 'channel' | 'direct', id: string } | null>(null);
  currentChat$ = this.currentChatSubject.asObservable();

  private messagesSubject = new BehaviorSubject<any[]>([]);

  channelDocId: string = '';
  channel: Channel = new Channel;

  constructor(private firestore: Firestore) {
    this.listenToChannels(); // Starte den Echtzeit-Listener
  }


  async addChannel(channel: Channel) {
    if (!channel.channelName.trim()) {
      return;
    }

    await addDoc(this.getChannelRef(), {
      channelName: channel.channelName.trim(),
      chanenelDescription: channel.channelDescription
    });
  }


  async loadChannel(fireId: string) {
    const channelSnap = await getDoc(this.getChannelDocRef(fireId));

    if (channelSnap.exists()) {
      this.channelDocId = fireId;
      const loadedChannel = this.setChannelObject(channelSnap.data());

      return loadedChannel;
    } else {
      return false;
    }
  }


  setChannelObject(obj: any): Channel {
    return {
      user: obj.name || '',
      channelName: obj.channelName || '',
      channelDescription: obj.channelDescription || '',
    };
  }


  listenToChannels() {
    const channelsCollection = collection(this.firestore, 'channels');
    onSnapshot(channelsCollection, (snapshot) => {
      const channels = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      this.channelsSubject.next(channels);
    });

    // ...doc.data() sorgt dafür, dass die Daten direkt ins Hauptobjekt kommen, anstatt in einem verschachtelten data-Objekt zu landen.
  }
  

  setCurrentChat(type: 'channel' | 'direct', id: string) {
    if (id) {
      this.currentChatSubject.next({ type, id });
    }
  }


  getChannelRef() {
    return collection(this.firestore, 'channels');
  }


  listenToMessages(channelId: string) {
    const channelRef = doc(this.firestore, 'channels', channelId);
    const messagesRef = collection(channelRef, 'Messages');

    // Echtzeit-Listener
    onSnapshot(messagesRef, (snapshot) => {
      const messages: any[] = [];
      snapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() });
      });
      this.messagesSubject.next(messages); // Nachrichten aktualisieren
    });

    return this.messagesSubject.asObservable(); // Gibt Observable zurück
  }


  getChannelDocRef(fireId: string) {
    return doc(this.getChannelRef(), fireId);;
  }


  async getOrCreateDirectChat(userId1: string, userId2: string) {
    const chatsRef = collection(this.firestore, 'directMessages');
    const chatQuery = query(chatsRef, where('participants', 'array-contains', userId1));

    const chatSnapshot = await getDocs(chatQuery);
    let chatId: string | null = null;

    chatSnapshot.forEach((doc) => {
      const data = doc.data() as { participants: string[] }; // Typensicherung hinzufügen
      if (data.participants && data.participants.includes(userId2)) {
        chatId = doc.id;
      }
    });

    if (!chatId) {
      const newChatRef = doc(chatsRef);
      await setDoc(newChatRef, {
        participants: [userId1, userId2],
        createdAt: new Date()
      });
      chatId = newChatRef.id;
    }
    return chatId;
}

  // Speichert eine Nachricht in einer existierenden Konversation
  async sendDirectMessage(chatId: string, senderId: string, text: string) {
    const messagesRef = collection(this.firestore, `directMessages/${chatId}/messages`);
    await addDoc(messagesRef, {
      senderId,
      text,
      timestamp: new Date()
    });
  }
}
