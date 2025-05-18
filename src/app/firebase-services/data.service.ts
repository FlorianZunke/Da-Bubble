// src/app/firebase-services/data.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/user.class';
import { MessageService } from './message.service';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  /* ------------------------- UI-Flags ------------------------- */
  sidebarDevspaceIsVisible = true;
  channelMenuIsHidden = false;
  directMessageMenuIsHidden = false;
  newMessageBoxIsVisible = true;
  directMessageBoxIsVisible = false;
  channelMessageBoxIsVisible = false;
  sidebarThreadIsVisible = true;

  /* Channel-Name für die Header-Leiste */
  displayChannelName = '';

  /* ------------------------- IDs (Demo) ----------------------- */
  idChannel = 0;
  idUser = 0;

  /* ------------------ eingeloggter User ----------------------- */
  private _loggedUser$ = new BehaviorSubject<User | null>(null);
  readonly loggedUser$ = this._loggedUser$.asObservable();

  /* --------------------- aktiver Chat-ID ---------------------- */
  private currentChatIdSubject = new BehaviorSubject<string | null>(null);
  readonly currentChatId$ = this.currentChatIdSubject.asObservable();

  /* ---------------------- Thread-Nachricht -------------------- */
  private currentThreadMessageSubject = new BehaviorSubject<any | null>(null);
  readonly currentThreadMessage$ = this.currentThreadMessageSubject.asObservable();

  /* ------------- Map von userId → User (für Avatare/Names) ------ */
  private _usersMap$ = new BehaviorSubject<Record<string, User>>({});
  readonly userById$ = this._usersMap$.asObservable();

  constructor(private messageService: MessageService) {
    // beim Service-Startup eingeloggten User aus sessionStorage laden
    const item = sessionStorage.getItem('user');
    if (item) {
      try {
        const u: User = JSON.parse(item);
        this._loggedUser$.next(u);
      } catch {
        sessionStorage.removeItem('user');
      }
    }
    // alle User laden und Map befüllen
    this.loadAllUsers();
  }

  /** komplett neu aus Firestore laden */
  async refreshUsers(): Promise<void> {
    await this.loadAllUsers();
  }

  private async loadAllUsers(): Promise<void> {
    try {
      const users = await this.messageService.getAllUsers();
      const map: Record<string, User> = {};
      users.forEach(u => map[u.id] = u);
      this._usersMap$.next(map);
    } catch (err) {
      console.error('Fehler beim Laden aller Nutzer:', err);
    }
  }

  /* ============================================================
                          PUBLIC METHODS
     ============================================================ */

  setdisplayChannelName(name: string): void {
    this.displayChannelName = name;
  }

  /** Speichert das komplette User-Objekt des eingeloggten Nutzers */
  setLoggedUser(user: User | null): void {
    this._loggedUser$.next(user);
    if (user) {
      sessionStorage.setItem('user', JSON.stringify(user));
      // auch in unserer Map updaten, falls bereits geladen
      const m = this._usersMap$.getValue();
      m[user.id] = user;
      this._usersMap$.next(m);
    } else {
      sessionStorage.removeItem('user');
    }
  }

  getLoggedUser(): User | null {
    return this._loggedUser$.getValue();
  }

  setChatId(chatId: string | null): void {
    this.currentChatIdSubject.next(chatId);
  }

  getChatId(): string | null {
    return this.currentChatIdSubject.getValue();
  }

  setCurrentThreadMessage(msg: any | null): void {
    this.currentThreadMessageSubject.next(msg);
  }

  getCurrentThreadMessage(): any | null {
    return this.currentThreadMessageSubject.getValue();
  }

  /** Beispiel-Channelliste (Demo) */
  channel: string[] = ['Entwicklerteam', 'Office-Team'];
}
