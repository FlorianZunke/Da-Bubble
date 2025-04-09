import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChannelService } from '../../firebase-services/channel.service';
import { User } from '../../models/user.class';
import { MessageService } from '../../firebase-services/message.service'; // <-- NEU: statt DataService
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-user-to-channel',
  standalone: true,
  templateUrl: './add-user-to-channel.component.html',
  styleUrls: ['./add-user-to-channel.component.scss'],
  imports: [CommonModule, FormsModule],
})
export class AddUserToChannelComponent implements OnInit {
  /**
   * Suchbegriff fürs Filterfeld
   */
  searchTerm: string = '';

  /**
   * Aus Firestore geladene User (verfügbar zum Hinzufügen)
   */
  availableUsers: User[] = [];

  /**
   * Bereits im Overlay angeklickte User (noch nicht in Firestore)
   */
  selectedUsers: User[] = [];

  constructor(
    private channelService: ChannelService,
    private messageService: MessageService, // <-- Wir nutzen jetzt MessageService
    @Inject(MAT_DIALOG_DATA) public data: { channelId: string },
    private dialogRef: MatDialogRef<AddUserToChannelComponent>
  ) {}

  ngOnInit(): void {
    this.loadAllUsers();
  }

  /**
   * Lädt die *echten* User aus Firestore über das MessageService
   */
  async loadAllUsers() {
    // Ruft in message.service.ts -> getAllUsers() auf
    this.availableUsers = await this.messageService.getAllUsers();
    console.log('Fetched users:', this.availableUsers);
  }

  /**
   * Filter-Logik fürs Eingabefeld
   */
  filteredUsers(): User[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.availableUsers;

    return this.availableUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(term) ||
        (user.email ?? '').toLowerCase().includes(term)
    );
  }

  /**
   * Klick auf einen gefilterten User -> ab in selectedUsers
   */
  addToSelection(user: User): void {
    if (!this.selectedUsers.includes(user)) {
      this.selectedUsers.push(user);
    }
  }

  /**
   * „X“-Button -> Entfernen aus selectedUsers
   */
  removeFromSelection(u: User): void {
    this.selectedUsers = this.selectedUsers.filter((sel) => sel !== u);
  }

  /**
   * Liefert den Avatar-Pfad zurück
   * (z. B. /img/avatars/avatar_0.svg)
   */
  getUserImagePath(user: User): string {
    return '/img/avatars/' + user.picture + '.svg';
  }

  /**
   * Erst beim finalen Klick -> alle User in Firestore-Channel
   */
  async confirmAddUsers(): Promise<void> {
    if (!this.data.channelId) {
      console.error('Keine channelId übergeben!');
      return;
    }
    for (const user of this.selectedUsers) {
      await this.channelService.addUserToChannel(this.data.channelId, user);
    }
    console.log('Alle ausgewählten User hinzugefügt');
    this.dialogRef.close();
  }

  /**
   * Abbrechen
   */
  closeDialog(): void {
    this.dialogRef.close();
  }
}
