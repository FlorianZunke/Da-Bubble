// src/app/firebase-services/data.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/user.class'; // ←  User‑Typ importieren

@Injectable({
  providedIn: 'root',
})
export class DataService {
  /* ------------------------- UI‑Flags ------------------------- */
  sidebarDevspaceIsVisible = true;
  channelMenuIsHidden = false;
  directMessageMenuIsHidden = false;
  newMessageBoxIsVisible = true;
  directMessageBoxIsVisible = false;
  channelMessageBoxIsVisible = false;
  sidebarThreadIsVisible = true;

  /* Channel‑Name für die Header‑Leiste */
  displayChannelName = '';

  /* ------------------------- IDs (Demo) ----------------------- */
  idChannel = 0;
  idUser = 0;

  /* ------------------ eingeloggter User ----------------------- */
  //  ⇒ immer ein komplettes User‑Objekt oder null
  private loggedUserSubject = new BehaviorSubject<User | null>(null);
  logedUser$ = this.loggedUserSubject.asObservable();

  /* --------------------- aktiver Chat‑ID ---------------------- */
  private currentChatIdSubject = new BehaviorSubject<string | null>(null);
  currentChatId$ = this.currentChatIdSubject.asObservable();

  /* ---------------------- Thread‑Nachricht -------------------- */
  private currentThreadMessageSubject = new BehaviorSubject<any | null>(null);
  currentThreadMessage$ = this.currentThreadMessageSubject.asObservable();

  /* ------------------------ CTOR ------------------------------ */
  constructor() {}

  /* ============================================================
                          PUBLIC METHODS
     ============================================================ */

  /* ---------- Channel‑Name setzen (Header) ---------- */
  setdisplayChannelName(name: string): void {
    this.displayChannelName = name;
  }

  /* ---------- User ---------- */
  /** Speichert das **komplette** User‑Objekt des eingeloggten Nutzers */
  setLogedUser(user: User | null): void {
    this.loggedUserSubject.next(user);
  }

  /** Liefert das aktuell gespeicherte User‑Objekt (oder null) */
  getLogedUser(): User | null {
    return this.loggedUserSubject.value;
  }

  /* ---------- Chat‑ID ---------- */
  setChatId(chatId: string | null): void {
    this.currentChatIdSubject.next(chatId);
  }

  getChatId(): string | null {
    return this.currentChatIdSubject.getValue();
  }

  /* ---------- Thread‑Nachricht ---------- */
  setCurrentThreadMessage(msg: any | null): void {
    this.currentThreadMessageSubject.next(msg);
  }

  getCurrentThreadMessage(): any | null {
    return this.currentThreadMessageSubject.getValue();
  }



  /* ---------- Beispiel‑Channelliste (Demo) ---------- */
  channel: string[] = ['Entwicklerteam', 'Office‑Team'];
}