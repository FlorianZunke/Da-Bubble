import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  where,
  getDocs,
} from '@angular/fire/firestore';
import { User } from '../models/user.class';
import { query, onSnapshot } from '@angular/fire/firestore';
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

  async addUser(newUser: User, password: string) {
    const docRef = await addDoc(this.getUserCol(), newUser)
      .catch((err) => {
      })
      .then((docRef) => {
        this.userDocId = docRef?.id;
      });
  }

  async loadUser(fireId: string) {
    const userRef = doc(this.firestore, 'users', fireId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const loadedUser = this.setUserObject(userSnap.data());

      return loadedUser;
    } else {
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
      fireId: obj.fireId ||'',
      picture: obj.picture || '',
      online: obj.online || '',
      status: obj.status || '',
    };
  }

  async updatePicture(avatar: string, userDocId: string) {
    const userRef = doc(this.firestore, 'users', userDocId);
    await updateDoc(userRef, {
      picture: avatar,
      fireId: userDocId,
    });
  }

  listenToUsers() {
    const usersCollection = collection(this.firestore, 'users');
    onSnapshot(usersCollection, (snapshot) => {
      const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      this.usersSubject.next(users);
    });
  }

  async getUserByEmail(email: string) {
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    return querySnapshot.docs;
  }

  async updateOnlineStatus(userFireId:string, newStatus:boolean) {
    const userRef = doc(this.firestore, 'users', userFireId);
    await updateDoc(userRef, {
      online: newStatus,
    });
  }

  async updateName(name: string, userDocId: string) {
    const userRef = doc(this.firestore, 'users', userDocId);
    await updateDoc(userRef, {
      name: name,
    });
  }
}
