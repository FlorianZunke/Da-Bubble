import { User } from './user.class';

export class Channel {

  id?: string; // Optionales Feld für Firestore-Dokument-ID
  user: User;
  channelName: string;
  channelDescription: string;
  channelCreatedBy: string;
  members: User[]; // Array aus User-Objekten
  messages: string[]; 

  constructor(obj?: any) {
    this.id = obj?.id; // Übernimm ggf. id, wenn vorhanden
    this.user = obj ? obj.user : new User;
    this.channelName = obj?.channelName || '';
    this.channelDescription = obj?.channelDescription || '';
    this.channelCreatedBy = obj ? obj.channelCreatedBy : '';
    this.members = obj?.members ? obj.members : [];
    this.messages= obj?.messages ? obj.messages : [];
  }
}