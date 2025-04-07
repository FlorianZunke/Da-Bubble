import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

}