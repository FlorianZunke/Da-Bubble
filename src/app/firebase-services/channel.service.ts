import { Injectable } from '@angular/core';

import { Firestore } from '@angular/fire/firestore';
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  query,
  updateDoc,
  arrayRemove,
  arrayUnion,
  orderBy,
} from 'firebase/firestore';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { docData } from 'rxfire/firestore';
import { Channel } from '../models/channel.class';
import { User } from '../models/user.class';

@Injectable({ providedIn: 'root' })
export class ChannelService {
  /* ─── globale States ────────────────────────────────── */
  loggedUserChannels: any[] = [];
  channelId = '';

  private loggedUser: any = null;

  private channelsSubject = new BehaviorSubject<any[]>([]);
  channels$ = this.channelsSubject.asObservable(); // Sidebar

  private currentChatSubject = new BehaviorSubject<{
    type: 'channel' | 'directMessages';
    id: string;
  } | null>(null);
  currentChat$ = this.currentChatSubject.asObservable();

  private currentDirectChatSubject = new BehaviorSubject<{
    type: 'directMessages';
    id: string;
  } | null>(null);
  currentDirectChat$ = this.currentDirectChatSubject.asObservable();

  private selectedChatPartnerSubject = new BehaviorSubject<any>(null);
  selectedChatPartner$ = this.selectedChatPartnerSubject.asObservable();

  private messagesSubject = new BehaviorSubject<any[]>([]);

  channelDocId = '';
  channel = new Channel();

  private activeChannelIndexSubject = new BehaviorSubject<number>(0);
  activeChannelIndex$ = this.activeChannelIndexSubject.asObservable();

  constructor(private firestore: Firestore) {
    this.listenToChannels(); // Echtzeit-Liste


  // DEBUG-Zugriff auf den Service über `window`
  (window as any).channelService = this;
  }

  /* ─── Helper Setter ─────────────────────────────────── */
  setLoggedUser(user: any) {
    this.loggedUser = user;
  }
  setSelectedChatPartner(user: any) {
    this.selectedChatPartnerSubject.next(user);
  }

  /* =====================================================
     1) Channel erstellen
  ====================================================== */
  async addChannel(channel: Channel) {
    if (!channel.channelName.trim()) return;
    await addDoc(this.getChannelRef(), {
      channelName: channel.channelName.trim(),
      channelDescription: channel.channelDescription,
      channelCreatedBy: this.loggedUser?.name ?? '',
      members: channel.members
    });
  }

  /* =====================================================
     2) Channel laden
  ====================================================== */
  async loadChannel(fireId: string) {
    const snap = await getDoc(this.getChannelDocRef(fireId));
    if (!snap.exists()) return false;
    this.channelDocId = fireId;
    return this.setChannelObject(snap.data());
  }

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

  /* =====================================================
     3) Channels-Listener
  ====================================================== */
  private listenToChannels() {
    const ref = collection(this.firestore, 'channels');
    onSnapshot(ref, (snap) => {
      const channels = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      this.channelsSubject.next(channels);
    });
  }

  /* – aktuelle Chats setzen – */
  setCurrentChannelChat(id: string) {
    this.currentChatSubject.next({ type: 'channel', id });
  }
  setCurrentDirectMessagesChat(id: string) {
    this.currentChatSubject.next({ type: 'directMessages', id });
  }


  /* =====================================================
     4) Nachrichten-Listener
  ====================================================== */
  getChannelRef() {
    return collection(this.firestore, 'channels');
  }
  getChannelDocRef(id: string) {
    return doc(this.getChannelRef(), id);
  }

  listenToChannelMessages(channelId: string) {
    const ref = collection(this.firestore, 'channels', channelId, 'messages');
    // Aufsteigend: älteste zuerst, inkl. Datum+Uhrzeit
    const q = query(ref, orderBy('timestamp', 'asc'));
    onSnapshot(q, snap => {
      const msgs: any[] = [];
      snap.forEach(d => msgs.push({ id: d.id, ...d.data() }));
      this.messagesSubject.next(msgs);
    });
    return this.messagesSubject.asObservable();
  }

  listenToDirectMessages(chatId: string): Observable<any[]> {
    // Referenz auf die Collection
    const ref = collection(
      this.firestore,
      'directMessages',
      chatId,
      'messages'
    );
    // Query mit orderBy timestamp → aufsteigend (älteste zuerst)
    const q = query(ref, orderBy('timestamp', 'asc'));
    const subj = new BehaviorSubject<any[]>([]);

    // Echtzeit-Listener
    onSnapshot(q, (snap) => {
      const msgs: any[] = [];
      snap.forEach((d) => msgs.push({ id: d.id, ...d.data() }));
      subj.next(msgs);
    });

    return subj.asObservable();
  }

  /* =====================================================
     5) User zu Channel hinzufügen
  ====================================================== */
  async addUserToChannel(channelId: string, user: User) {
    const ref = doc(this.firestore, 'channels', channelId);
    await updateDoc(ref, {
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

  /* =====================================================
   6) User zu Channel entfernen
  ====================================================== */
  async removeUserFromChannel(channelId: string, user: any) {
    const ref = doc(this.firestore, 'channels', channelId);
    await updateDoc(ref, {
      members: arrayRemove(user)  // <-- direkt das Originalobjekt verwenden
    });
  }

  /* =====================================================
     7) Direkt-Nachrichten-Hilfen
  ====================================================== */
  async getOrCreateDirectChat(
    userId1: string,
    userId2: string
  ): Promise<string> {
    const chatId = [userId1.toString(), userId2.toString()].sort().join('_');
    const chatRef = doc(this.firestore, 'directMessages', chatId);
    if (!(await getDoc(chatRef)).exists())
      await setDoc(chatRef, {
        participants: [userId1, userId2],
        createdAt: new Date(),
      });
    return chatId;
  }

  /* =====================================================
     8) Nachrichten senden
  ====================================================== */
  async sendDirectMessage(chatId: string, sender: User, text: string) {
    if (!chatId || !text.trim()) return;
    const ref = collection(
      this.firestore,
      'directMessages',
      chatId,
      'messages'
    );
    await addDoc(ref, {
      sender,
      text: text.trim(),
      timestamp: serverTimestamp(),
    });
  }

  async sendChannelMessage(channelId: string, sender: User, text: string) {
    if (!channelId || !text.trim()) return;
    const ref = collection(this.firestore, 'channels', channelId, 'messages');
    await addDoc(ref, {
      sender,
      text: text.trim(),
      timestamp: serverTimestamp(),
    });
  }

  /* ============================================================
        CHANNEL EDIT (Name / Description)
  ============================================================ */
  async editChannel(
    channelId: string,
    updatedData: { channelName: string; channelDescription: string; channelCreatedBy: string }
  ) {
    const trimmedName = updatedData.channelName?.trim();
    const trimmedDescription = updatedData.channelDescription?.trim();
    const trimmedChannelCreatedBy = updatedData.channelCreatedBy?.trim();

    if (!trimmedName || !trimmedChannelCreatedBy) {
      return;
    }

    const channelDocRef = doc(this.firestore, 'channels', channelId);

    await updateDoc(channelDocRef, {
      channelName: trimmedName,
      channelDescription: trimmedDescription,
      channelCreatedBy: trimmedChannelCreatedBy
    });
  }

  async editChannelMessage(
    channelId: string,
    messageId: string,
    newText: string
  ) {
    const ref = doc(
      this.firestore,
      'channels',
      channelId,
      'messages',
      messageId
    );
    await updateDoc(ref, { text: newText });
  }

  listenToThreadReplies(
    channelId: string,
    parentId: string
  ): Observable<any[]> {
    const ref = collection(
      this.firestore,
      'channels',
      channelId,
      'messages',
      parentId,
      'replies'
    );
    const q = query(ref, orderBy('timestamp', 'asc'));
    const subj = new BehaviorSubject<any[]>([]);
    onSnapshot(q, (snap) => {
      const replies: any[] = [];
      snap.forEach((d) => replies.push({ id: d.id, ...d.data() }));
      subj.next(replies);
    });
    return subj.asObservable();
  }

  async sendThreadReply(
    channelId: string,
    parentId: string,
    sender: User,
    text: string
  ) {
    const ref = collection(
      this.firestore,
      'channels',
      channelId,
      'messages',
      parentId,
      'replies'
    );
    await addDoc(ref, {
      sender,
      text,
      reactions: [],
      timestamp: serverTimestamp(),
    });
  }

  async updateThreadReplyReactions(
    channelId: string,
    parentId: string,
    replyId: string,
    reactions: string[]
  ) {
    const ref = doc(
      this.firestore,
      'channels',
      channelId,
      'messages',
      parentId,
      'replies',
      replyId
    );
    await updateDoc(ref, { reactions });
  }

  /* =====================================================
     9) THREAD-SUPPORT (DIRECT-MESSAGE)  ← NEU
  ====================================================== */
  listenToDmThreadReplies(chatId: string, parentId: string): Observable<any[]> {
    const ref = collection(
      this.firestore,
      'directMessages',
      chatId,
      'messages',
      parentId,
      'replies'
    );
    const q = query(ref, orderBy('timestamp', 'asc'));
    const subj = new BehaviorSubject<any[]>([]);
    onSnapshot(q, (snap) => {
      const replies: any[] = [];
      snap.forEach((d) => replies.push({ id: d.id, ...d.data() }));
      subj.next(replies);
    });
    return subj.asObservable();
  }

  async sendDmThreadReply(
    chatId: string,
    parentId: string,
    sender: User,
    text: string
  ) {
    const ref = collection(
      this.firestore,
      'directMessages',
      chatId,
      'messages',
      parentId,
      'replies'
    );
    await addDoc(ref, {
      sender,
      text,
      reactions: [],
      timestamp: serverTimestamp(),
    });
  }

  async updateDmThreadReplyReactions(
    chatId: string,
    parentId: string,
    replyId: string,
    reactions: string[]
  ) {
    const ref = doc(
      this.firestore,
      'directMessages',
      chatId,
      'messages',
      parentId,
      'replies',
      replyId
    );
    await updateDoc(ref, { reactions });
  }

  /* =====================================================
     10) Reaktionen bei Haupt-Nachrichten
  ====================================================== */
  async updateMessageReactions(
    channelId: string,
    messageId: string,
    reactions: string[]
  ) {
    const ref = doc(
      this.firestore,
      'channels',
      channelId,
      'messages',
      messageId
    );
    await updateDoc(ref, { reactions });
  }

  async updateDirectMessageReactions(
    chatId: string,
    messageId: string,
    reactions: string[]
  ) {
    const ref = doc(
      this.firestore,
      'directMessages',
      chatId,
      'messages',
      messageId
    );
    await updateDoc(ref, { reactions });
  }

  listenToChannel(channelId: string): Observable<Channel> {
    const ref = doc(this.firestore, 'channels', channelId);
    //  idField: 'id'  →  Firestore-ID kommt als Eigenschaft 'id' mit rein
    return docData(ref, { idField: 'id' }) as Observable<Channel>;
  }





  setCurrentActiveChannel(id:number) {
    this.activeChannelIndexSubject.next(id);
  }

}
