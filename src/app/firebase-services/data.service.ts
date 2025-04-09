import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  sidebarDevspaceIsVisible: boolean = true;
  channelMenuIsHidden: boolean = false;
  directMessageMenuIsHidden: boolean = false;
  newMessageBoxIsVisible: boolean = true;
  directMessageBoxIsVisible: boolean = false;
  channelMessageBoxIsVisible: boolean = false;
  sidebarThreadIsVisible: boolean = true;
  displayChannelName: string = '';

  idChannel: number = 0;
  idUser: number = 0;

  private logedUserSubject = new BehaviorSubject<any>(null); // Reaktive Variable
  logedUser$ = this.logedUserSubject.asObservable(); // Observable für Komponenten

  private currentChatIdSubject = new BehaviorSubject<string | null>(null);
  currentChatId$ = this.currentChatIdSubject.asObservable();

  constructor() {}

  /** Beispiel-Channel / User-Liste */
  channel: string[] = ['Entwicklerteam', 'Office-Team'];

  setdisplayChannelName(displayChannelName: string): void {
    this.displayChannelName = displayChannelName;
  }
  // =============================
  // Reaktive User-Funktionen
  // =============================
  setLogedUser(user: any) {
    this.logedUserSubject.next(user); // Neuer Wert wird gesetzt
  }

  getLogedUser() {
    return this.logedUserSubject.value; // Aktuellen Wert abrufen
  }

  setChatId(chatId: string) {
    this.currentChatIdSubject.next(chatId);
  }

  getChatId() {
    return this.currentChatIdSubject.getValue();
  }

  // =============================
  // NEUE Methode, um alle User zu bekommen
  // =============================
  // async getAllUsers(): Promise<any[]> {
    // Falls du sie typisieren willst, kannst du statt any[] => User[] schreiben
    // und das 'users' Array auf dein User-Model mappen.
  //   return this.users;
  // }
}
