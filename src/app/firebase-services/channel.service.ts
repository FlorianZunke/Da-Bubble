import { inject, Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { collection } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {

  firestore = inject(Firestore)

  constructor() { }

  getChannelRef() {
    return collection(this.firestore, 'channels');
  }
}
