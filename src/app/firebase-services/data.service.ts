// src/app/firebase-services/data.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user.class'; // ←  User‑Typ importieren

@Injectable({
  providedIn: 'root',
})
export class DataService  {
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
  private _loggedUser$ = new BehaviorSubject<User | null>(null);
  readonly loggedUser$ = this._loggedUser$.asObservable();

  /* --------------------- aktiver Chat‑ID ---------------------- */
  private currentChatIdSubject = new BehaviorSubject<string | null>(null);
  currentChatId$ = this.currentChatIdSubject.asObservable();

  /* ---------------------- Thread‑Nachricht -------------------- */
  private currentThreadMessageSubject = new BehaviorSubject<any | null>(null);
  currentThreadMessage$ = this.currentThreadMessageSubject.asObservable();

  /* ------------------------ CTOR ------------------------------ */
  constructor() {
    const item = sessionStorage.getItem('user');
    if (item) {
      try {
        const u: User = JSON.parse(item);
        this._loggedUser$.next(u);
      } catch {
        sessionStorage.removeItem('user');
      }
    }
  }

  /* ============================================================
                          PUBLIC METHODS
     ============================================================ */

  /* ---------- Channel‑Name setzen (Header) ---------- */
  setdisplayChannelName(name: string): void {
    this.displayChannelName = name;
  }

  /* ---------- User ---------- */
  /** Speichert das **komplette** User‑Objekt des eingeloggten Nutzers */
  setLoggedUser(user: User | null): void {
    this._loggedUser$.next(user);
    if (user) {
      sessionStorage.setItem('user', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('user');
    }
  }

  /** Liefert das aktuell gespeicherte User‑Objekt (oder null) */
  getLoggedUser(): User | null {
    return this._loggedUser$.getValue();
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

  toggleSidebarDevspace() {
  const element = document.getElementById('close-sidebar-devspace');

  if (element) {
      element.classList.toggle('d-none');
      this.closeThread();
    }
    this.sidebarDevspaceIsVisible = !this.sidebarDevspaceIsVisible;
  }

  closeThread() {
    if (!this.sidebarDevspaceIsVisible) {
      this.sidebarThreadIsVisible = false;
    }
  }
}
