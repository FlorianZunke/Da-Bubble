import { User } from './user.class';

export class Channel {
  id?: string; // Optionales Feld für Firestore-Dokument-ID
  channelName: string;
  channelDescription: string;
  members: User[]; // Array aus User-Objekten

  constructor(obj?: any) {
    this.id = obj?.id; // Übernimm ggf. id, wenn vorhanden
    this.channelName = obj?.channelName || '';
    this.channelDescription = obj?.channelDescription || '';
    this.members = obj?.members ? obj.members : [];
  }
}
