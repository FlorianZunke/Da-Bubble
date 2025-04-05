import { Injectable } from '@angular/core';
import { inject } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  where,
  getDocs,
  setDoc
} from '@angular/fire/firestore';
import { User } from '../models/user.class';
import { query } from '@angular/fire/firestore';
import { onSnapshot } from '@angular/fire/firestore';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LogService {
  firestore = inject(Firestore);
  userDocId: any = '';
  loadedUser: any = {};

  constructor() {
    this.listenToUsers(); // Starte den Echtzeit-Listener
  }

  private usersSubject = new BehaviorSubject<any[]>([]); // Hier wird das Subject definiert
  users$ = this.usersSubject.asObservable(); // Observable für die Sidebar


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


  listenToUsers() {
    const usersCollection = collection(this.firestore, 'users');
    onSnapshot(usersCollection, (snapshot) => {
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      this.usersSubject.next(users);
    });
  }

  async getUserByEmail(email: string) {
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('email', '==', email));

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log('Kein Benutzer mit dieser E-Mail gefunden.');
      return null;
    }

    return querySnapshot.docs
  }

}
