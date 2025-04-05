import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  sidebarDevspaceIsVisible: boolean = true;
  channelMenuIsHidden: boolean = false;
  directMessageMenuIsHidden: boolean = false;
  newMessageBoxIsVisible: boolean = false;
  directMessageBoxIsVisible: boolean = false;
  channelMessageBoxIsVisible: boolean = true;
  sidebarThreadIsVisible: boolean = true;

  idChannel: number = 0;
  idUser: number = 0;

  private logedUserSubject = new BehaviorSubject<any>(null); // Reaktive Variable
  logedUser$ = this.logedUserSubject.asObservable(); // Observable für Komponenten

  constructor() { }

  channel:string[] = ['Entwicklerteam','Office-Team'];
  users = [
    {
      "name": "Frederik Beck (Du)",
      "picture": "avatar1",
      "pictureSvg": "avatar_5"
    },
    {
      "name": "Sofia Müller",
      "picture": "avatar2",
      "pictureSvg": "avatar_4"
    },
    {
      "name": "Noah Braun",
      "picture": "avatar3",
      "pictureSvg": "avatar_3"
    },
    {
      "name": "Elise Roth",
      "picture": "avatar4",
      "pictureSvg": "avatar_0"
    },
    {
      "name": "Elias Neuman",
      "picture": "avatar5",
      "pictureSvg": "avatar_1"
    },
    {
      "name": "Steffen Hoffmann",
      "picture": "avatar6",
      "pictureSvg": "avatar_2"
    }
  ]

  setLogedUser(user: any) {
    this.logedUserSubject.next(user); // Neuer Wert wird gesetzt
  }

  getLogedUser() {
    return this.logedUserSubject.value; // Aktuellen Wert abrufen
  }
}
