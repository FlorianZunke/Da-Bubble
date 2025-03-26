import { inject, Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { collection, addDoc, serverTimestamp, doc, getDoc, getDocs, onSnapshot } from 'firebase/firestore';
import { Channel } from '../models/channel.class';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {
  private channelsSubject = new BehaviorSubject<any[]>([]); // 🔥 Hier wird das Subject definiert
  channels$ = this.channelsSubject.asObservable(); // Observable für die Sidebar

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
      messageTime: serverTimestamp(),
      channelName: channel.channelName.trim()
    });
  }


  async loadChannel(fireId: string) {
    const channelSnap = await getDoc(this.getChannelDocRef(fireId));

    if (channelSnap.exists()) {
      this.channelDocId = fireId;
      const loadedChannel = this.setChannelObject(channelSnap.data());
      console.log(loadedChannel);

      return loadedChannel;
    } else {
      return false;
    }
  }


  setChannelObject(obj: any): Channel {
    return {
      id: obj.id,
      user: obj.name || '',
      messageTime: obj.email || '',
      channelName: obj.channelName || '',
      messageReaktions: obj.picture || '',
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


  getChannelRef() {
    return collection(this.firestore, 'channels');
  }


  getChannelDocRef(fireId: string) {
    return doc(this.getChannelRef(), fireId);;
  }
}
