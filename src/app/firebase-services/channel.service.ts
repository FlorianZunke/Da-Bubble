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
  orderBy,
} from 'firebase/firestore';
import { Channel } from '../models/channel.class';
import { User } from '../models/user.class';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { docData } from 'rxfire/firestore';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  channelId: string = '';

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

  private selectedChatPartnerSubject = new BehaviorSubject<any>(null);
  selectedChatPartner$ = this.selectedChatPartnerSubject.asObservable();

  setSelectedChatPartner(user: any) {
    this.selectedChatPartnerSubject.next(user);
  }

  private messagesSubject = new BehaviorSubject<any[]>([]);

  channelDocId: string = '';
  channel: Channel = new Channel();

  constructor(private firestore: Firestore) {
    this.listenToChannels(); // Starte den Echtzeit-Listener
  }

  setLoggedUser(user: any) {
    this.loggedUser = user;
  }

  /* ============================================================
        1) CHANNEL ERSTELLEN
  ============================================================ */
  async addChannel(channel: Channel) {
    if (!channel.channelName.trim()) {
      return;
    }
    await addDoc(this.getChannelRef(), {
      channelName: channel.channelName.trim(),
      channelDescription: channel.channelDescription,
      channelCreatedBy: this.loggedUser.name,
      // members: []
    });
  }

  /* ============================================================
        2) CHANNEL LADEN
  ============================================================ */
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

  /* ============================================================
        3) CHANNEL‑DATEN → Channel‑Objekt
  ============================================================ */
  setChannelObject(obj: any): Channel {
    return {
      id: obj?.id,
      user: obj?.user || new User(),
      channelName: obj?.channelName || '',
      channelDescription: obj?.channelDescription || '',
      channelCreatedBy: obj?.channelCreatedBy || '',
      members: obj?.members || [],
      messages: obj?.messages || [],
    };
  }

  /* ============================================================
        4) ECHTZEIT‑LISTENER FÜR ALLE CHANNELS
  ============================================================ */
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

  /* ------------------------------------------------------------
        Setter für Chat‑Status
  ------------------------------------------------------------ */
  setCurrentChannelChat(type: 'channel', id: string) {
    this.currentChatSubject.next({ type, id });
  }

  setCurrentDirectMessagesChat(type: 'directMessages', id: string) {
    this.currentChatSubject.next({ type, id });
  }

  /* ============================================================
        DIREKTNACHRICHTEN
  ============================================================ */
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

  listenToDirectMessages(chatId: string) {
    const channelRef = doc(this.firestore, 'directMessages', chatId);
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

  /* ============================================================
        USER → CHANNEL hinzufügen
  ============================================================ */
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

  /* ============================================================
        ECHTZEIT‑LISTENER FÜR EINEN CHANNEL
  ============================================================ */
  listenToChannel(channelId: string): Observable<Channel> {
    const channelDoc = doc(this.firestore, 'channels', channelId);
    return docData(channelDoc, { idField: 'id' }) as Observable<Channel>;
  }

  /* ============================================================
        DIREKTNACHRICHTEN‑HILFSMETHODEN
  ============================================================ */
  async getOrCreateDirectChat(
    userId1: string,
    userId2: string
  ): Promise<string> {
    const chatId = this.generateChatId(userId1, userId2);
    const chatRef = doc(this.firestore, 'directMessages', chatId);
    const chatSnap = await getDoc(chatRef);
    if (!chatSnap.exists()) {
      await setDoc(chatRef, {
        participants: [userId1, userId2],
        createdAt: new Date(),
      });
    }
    return chatId;
  }

  generateChatId(userId1: string, userId2: string): string {
    const id1 = userId1.toString();
    const id2 = userId2.toString();
    return [id1, id2].sort().join('_');
  }

  // src/app/firebase-services/channel.service.ts
  // statt senderId:string → sender: User
  // statt senderId: string → sender: User
  async sendDirectMessage(
    chatId: string,
    sender: User,
    text: string
  ): Promise<void> {
    if (!chatId || !text.trim()) return;
    const messagesRef = collection(
      this.firestore,
      `directMessages/${chatId}/messages`
    );
    await addDoc(messagesRef, {
      sender, // <— komplettes Objekt
      text: text.trim(),
      timestamp: serverTimestamp(),
    });
  }

  async sendChannelMessage(
    channelId: string,
    sender: User,
    text: string
  ): Promise<void> {
    if (!channelId || !text.trim()) return;
    const messagesRef = collection(
      this.firestore,
      `channels/${channelId}/messages`
    );
    await addDoc(messagesRef, {
      sender, // <— komplettes Objekt
      text: text.trim(),
      timestamp: serverTimestamp(),
    });
  }

  /* ============================================================
        CHANNEL EDIT (Name / Description)
  ============================================================ */
  async editChannel(
    channelId: string,
    updatedData: { channelName: string; channelDescription: string }
  ) {
    const trimmedName = updatedData.channelName?.trim();
    const trimmedDescription = updatedData.channelDescription?.trim() ?? '';
    if (!trimmedName) {
      return;
    }
    const channelDocRef = doc(this.firestore, 'channels', channelId);
    await updateDoc(channelDocRef, {
      channelName: trimmedName,
      channelDescription: trimmedDescription,
    });
  }

  async editChannelMessage(
    channelId: string,
    messageId: string,
    newText: string
  ): Promise<void> {
    const msgRef = doc(
      this.firestore,
      'channels',
      channelId,
      'messages',
      messageId
    );
    await updateDoc(msgRef, { text: newText });
  }

  /* ============================================================
        THREAD‑SUPPORT  (NEU)
  ============================================================ */

  /**
   * Echtzeit‑Replies eines Threads
   *   Pfad: channels/{channelId}/messages/{parentId}/replies
   */
  listenToThreadReplies(
    channelId: string,
    parentMessageId: string
  ): Observable<any[]> {
    const repliesRef = collection(
      this.firestore,
      'channels',
      channelId,
      'messages',
      parentMessageId,
      'replies'
    );
    // Sortiert nach timestamp
    const q = query(repliesRef, orderBy('timestamp', 'asc'));
    const subj = new BehaviorSubject<any[]>([]);
    onSnapshot(q, (snap) => {
      const replies: any[] = [];
      snap.forEach((d) => replies.push({ id: d.id, ...d.data() }));
      subj.next(replies);
    });
    return subj.asObservable();
  }

  /**
   * Antwort in Thread posten
   */
  async sendThreadReply(
    channelId: string,
    parentMessageId: string,
    sender: User,
    text: string
  ): Promise<void> {
    const repliesRef = collection(
      this.firestore,
      'channels',
      channelId,
      'messages',
      parentMessageId,
      'replies'
    );
    await addDoc(repliesRef, {
      sender,
      text,
      timestamp: new Date(),
    });
  }

  /**
   * Reaktions‑Array einer Message aktualisieren
   */
  async updateMessageReactions(
    channelId: string,
    messageId: string,
    reactions: string[]
  ): Promise<void> {
    const msgRef = doc(
      this.firestore,
      'channels',
      channelId,
      'messages',
      messageId
    );
    await updateDoc(msgRef, { reactions });
  }

  /** Reaktionen einer Direct Message in Firestore aktualisieren */
  async updateDirectMessageReactions(
    chatId: string,
    messageId: string,
    reactions: string[]
  ): Promise<void> {
    const msgRef = doc(
      this.firestore,
      'directMessages',
      chatId,
      'messages',
      messageId
    );
    await updateDoc(msgRef, { reactions });
  }
}
