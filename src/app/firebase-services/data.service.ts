import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  sidebarDevspaceIsVisible: boolean = true;
  newMessageBoxIsVisible: boolean = false;
  directMessageBoxIsVisible: boolean = false;
  channelMessageBoxIsVisible: boolean = false;
  sidebarThreadIsVisible: boolean = false;

  idUser: number = 0;

  constructor() { }

  users = [
    {
      "name": "Frederik Beck (Du)",
      "picture": "avatar1"
    },
    {
      "name": "Sofia Müller",
      "picture": "avatar2"
    },
    {
      "name": "Noah Braun",
      "picture": "avatar3"
    },
    {
      "name": "Elise Roth",
      "picture": "avatar4"
    },
    {
      "name": "Elias Neuman",
      "picture": "avatar5"
    },
    {
      "name": "Steffen Hoffmann",
      "picture": "avatar6"
    }
  ]
}
