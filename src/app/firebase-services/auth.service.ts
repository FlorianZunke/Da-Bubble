import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null); // Beobachteter Benutzer
  currentUser$ = this.currentUserSubject.asObservable(); // Observable für den aktuellen Benutzer

  constructor(private firestore: Firestore) {
    this.loadCurrentUser();
  }

  // Laden des aktuellen Benutzers (beispielsweise über Firebase Auth)
  async loadCurrentUser() {
    const user = getAuth().currentUser; // Hole den aktuell angemeldeten Benutzer

    if (user) {
      // Hole die Benutzerinformationen aus Firestore
      const userRef = doc(this.firestore, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        this.currentUserSubject.next(userSnap.data()); // Benutzerdaten setzen
      }
    }
  }
}
