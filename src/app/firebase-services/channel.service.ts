import { inject, Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
  query,
  where,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore';
import { Channel } from '../models/channel.class';
import { User } from '../models/user.class';
import { BehaviorSubject, Observable } from 'rxjs';
import { docData } from 'rxfire/firestore'; // Falls nicht installiert, kannst du docData selber definieren oder @angular/fire/firestore/rxfire nutzen

@Injectable({
  providedIn: 'root',
})
export class ChannelService {

  private loggedUser: any = null;
  private channelsSubject = new BehaviorSubject<any[]>([]);

  channels$ = this.channelsSubject.asObservable(); // Observable für die Sidebar

  private currentChatSubject = new BehaviorSubject<{
    type: 'channel' | 'directMessages';
    id: string;
  } | null>(null);
  currentChat$ = this.currentChatSubject.asObservable();

  private currentDirectChatSubject = new BehaviorSubject<{
    type: 'directMessages';
    id: any;
  } | null>(null);
  currentDirectChat$ = this.currentDirectChatSubject.asObservable();

  private messagesSubject = new BehaviorSubject<any[]>([]);

  channelDocId: string = '';
  channel: Channel = new Channel();

  constructor(private firestore: Firestore) {
    this.listenToChannels(); // Starte den Echtzeit-Listener
  }

  setLoggedUser(user: any) {
    this.loggedUser = user;
  }
  

  // =========================================
  // 1) CHANNEL ERSTELLEN
  // =========================================
  async addChannel(channel: Channel) {
    if (!channel.channelName.trim()) {
      return;
    }
    await addDoc(this.getChannelRef(), {
      channelName: channel.channelName.trim(),
      channelDescription: channel.channelDescription,
      channelCreatedBy: this.loggedUser.name
      // members: [] // optional: Du kannst hier direkt members: [] anlegen
    });
  }

  // =========================================
  // 2) CHANNEL LADE-FUNKTION
  // =========================================
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

  // =========================================
  // 3) CHANNEL-DATEN-OBJEKT ERSTELLEN
  // =========================================
  setChannelObject(obj: any): Channel {
    return {
      user: obj.name || '',
      channelName: obj.channelName || '',
      channelDescription: obj.channelDescription || '',
      channelCreatedBy: obj.channelCreatedBy || '',
      members: obj?.members || [],
    };
  }

  // =========================================
  // 4) ECHTZEIT-LISTENER FÜR ALLE CHANNELS
  // =========================================
  listenToChannels() {
    const channelsCollection = collection(this.firestore, 'channels');
    onSnapshot(channelsCollection, (snapshot) => {
      const channels = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      this.channelsSubject.next(channels);
    });
  }

  // Setter für den Chat-Status
  setCurrentChannelChat(type: 'channel', id: string) {
    this.currentChatSubject.next({ type, id });
  }

  setCurrentDirectMessagesChat(type: 'directMessages', id: string) {
    this.currentChatSubject.next({ type, id });
  }

  // =========================================
  // DIREKTNACHRICHTEN
  // =========================================
  getDirectMessagesRef() {
    return collection(this.firestore, 'directMessages');
  }

  getChannelRef() {
    return collection(this.firestore, 'channels');
  }

  listenToChannelMessages(channelId: string) {
    const channelRef = doc(this.firestore, 'channels', channelId);
    const messagesRef = collection(channelRef, 'messages');

    onSnapshot(messagesRef, (snapshot) => {
      const messages: any[] = [];
      snapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() });
      });
      this.messagesSubject.next(messages);
    });
    return this.messagesSubject.asObservable();
  }

  listenToDiectMessages(channelId: string) {
    const channelRef = doc(this.firestore, 'directMessages', channelId);
    const messagesRef = collection(channelRef, 'messages');

    onSnapshot(messagesRef, (snapshot) => {
      const messages: any[] = [];
      snapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() });
      });
      this.messagesSubject.next(messages);
    });
    return this.messagesSubject.asObservable();
  }

  getChannelDocRef(fireId: string) {
    return doc(this.getChannelRef(), fireId);
  }

  // =========================================
  // NEUE METHODEN
  // =========================================

  // 5) USER ZUM CHANNEL HINZUFÜGEN
  async addUserToChannel(channelId: string, user: User) {
    const channelRef = doc(this.firestore, 'channels', channelId);
    await updateDoc(channelRef, {
      members: arrayUnion({
        name: user.name,
        email: user.email,
        fireId: user.fireId,
        picture: user.picture,
        online: user.online,
        status: user.status,
      }),
    });
  }

  // 6) ECHTZEIT-LISTENER FÜR EINEN SPEZIFISCHEN CHANNEL (Mithilfe docData)
  listenToChannel(channelId: string): Observable<Channel> {
    const channelDoc = doc(this.firestore, 'channels', channelId);
    // docData liefert ein Observable mit den Feldern des Dokuments
    return docData(channelDoc, { idField: 'id' }) as Observable<Channel>;
  }

  // =========================================
  // METHODEN FÜR DIREKTNACHRICHTEN
  // =========================================
  // HIER DER FIX: Die Funktion gibt ein Promise<string> zurück.
  async getOrCreateDirectChat(
    userId1: string,
    userId2: string
  ): Promise<string> {
    let chatId = '';
    const chatsRef = collection(this.firestore, 'directMessages');
    const chatQuery = query(
      chatsRef,
      where('participants', 'array-contains', userId1)
    );

    const chatSnapshot = await getDocs(chatQuery);

    // Suche, ob ein Doc existiert, das userId2 ebenfalls in 'participants' hat
    chatSnapshot.forEach((dc) => {
      const data = dc.data() as { participants: string[] };
      if (data.participants && data.participants.includes(userId2)) {
        chatId = dc.id;
      }
    });

    // Falls kein Chat gefunden wird, erstelle neuen
    if (!chatId) {
      const newChatRef = doc(chatsRef);
      await setDoc(newChatRef, {
        participants: [userId1, userId2],
        createdAt: new Date(),
      });
      chatId = newChatRef.id;
    }

    return chatId; // <--- WICHTIG: String zurückgeben, damit openDirectChat(...) den Wert nutzen kann
  }

  async sendDirectMessage(chatId: string, senderId: string, text: string) {
    const messagesRef = collection(
      this.firestore,
      `directMessages/${chatId}/messages`
    );
    await addDoc(messagesRef, {
      senderId,
      text,
      timestamp: new Date(),
    });
    console.log('Document written with ID:', messagesRef);
  }
}
