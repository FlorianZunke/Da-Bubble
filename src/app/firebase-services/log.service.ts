import { Injectable } from '@angular/core';
import { inject } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { User } from '../models/user.class';
import { query } from '@angular/fire/firestore';
import { onSnapshot } from '@angular/fire/firestore';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class LogService {
  firestore = inject(Firestore);

  constructor() {}

  async addUser(newUser: User) {
    const docRef = await addDoc(this.getUserCol(), newUser)
    .catch((err) => {
      console.log(err, 'dat hat nich jeklappt!');
    })
    .then((docRef) => {
      console.log('Document written with ID: ', docRef?.id);
    });
  }

  getUserCol() {
    return collection(this.firestore, 'users')
  }
}
