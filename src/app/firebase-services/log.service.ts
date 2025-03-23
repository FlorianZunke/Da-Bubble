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
  userDocId: any = '';
  loadedUser: any = {};


  constructor() {}

  async addUser(newUser: User) {
    const docRef = await addDoc(this.getUserCol(), newUser)
      .catch((err) => {
        console.log(err, 'dat hat nich jeklappt!');
      })
      .then((docRef) => {
        // console.log('Document written with ID: ', docRef?.id);
        this.userDocId = docRef?.id;
        // console.log('variable erfolgreich gespeichert: ', this.userDocId);
      });
  }

  async loadUser(fireId: string) {
    const userRef = doc(this.firestore, 'users', fireId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const loadedUser = this.setUserObject(userSnap.data());
      // console.log(loadedUser);

      return loadedUser;
    } else {
      // docSnap.data() will be undefined in this case
      return false;
    }
  }

  getUserCol() {
    return collection(this.firestore, 'users');
  }

  setUserObject(obj: any): User {
    return {
      id: obj.id,
      name: obj.name || '',
      email: obj.email || '',
      password: '*********',
      picture: obj.picture || '',
      online: obj.online || '',
      status: obj.status || '',
    };
  }

  async updatePicture(avatar:string, userDocId: string) {
    // console.log('usre id', userDocId);

    const userRef = doc(this.firestore, 'users', userDocId);
    await updateDoc(userRef, {
      picture: avatar
    });
  }
}
