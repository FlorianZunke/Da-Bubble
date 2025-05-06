import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChannelService } from '../../firebase-services/channel.service';
import { User } from '../../models/user.class';
import { MessageService } from '../../firebase-services/message.service';
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
  /** Suchbegriff fürs Filterfeld */
  searchTerm: string = '';

  /** Alle verfügbaren User aus Firestore, die prinzipiell hinzugefügt werden können */
  availableUsers: User[] = [];

  /** Bereits ausgewählte User (noch nicht final in Firestore übernommen) */
  selectedUsers: User[] = [];

  /** Aktuelle Mitglieder, die bereits im Channel vorhanden sind */
  channelMembers: User[] = [];

  constructor(
    private channelService: ChannelService,
    private messageService: MessageService,
    @Inject(MAT_DIALOG_DATA) public data: { channelId: string },
    private dialogRef: MatDialogRef<AddUserToChannelComponent>
  ) {}

  ngOnInit(): void {
    this.loadAllUsers();
    this.loadChannelMembers();
  }

  /**
   * Lädt die echten User aus Firestore über MessageService.getAllUsers().
   */
  async loadAllUsers() {
    this.availableUsers = await this.messageService.getAllUsers();
    console.log('Fetched available users:', this.availableUsers);
  }

  /**
   * Lädt die aktuellen Mitglieder des Channels, um bereits hinzugefügte User auszuschließen.
   */
  loadChannelMembers(): void {
    this.channelService
      .listenToChannel(this.data.channelId)
      .subscribe((channelData) => {
        this.channelMembers = channelData.members || [];
        console.log('Aktuelle Channel-Mitglieder:', this.channelMembers);
      });
  }

  /**
   * Filtert die Liste der verfügbaren User basierend auf searchTerm und schließt
   * alle User aus, die bereits Mitglied im Channel sind.
   */
  filteredUsers(): User[] {
    const term = this.searchTerm.trim().toLowerCase();
    // Filtern: Entferne User, die bereits in channelMembers enthalten sind.
    const notMembers = this.availableUsers.filter(
      (user) =>
        !this.channelMembers.some((member) => member.fireId === user.fireId)
    );
    if (!term) return notMembers;
    return notMembers.filter(
      (user) =>
        user.name.toLowerCase().includes(term) ||
        (user.email ?? '').toLowerCase().includes(term)
    );
  }

  /**
   * Fügt einen User der Auswahl hinzu und entfernt ihn aus der verfügbaren Liste.
   */
  addToSelection(user: User): void {
    if (!this.selectedUsers.find((sel) => sel.fireId === user.fireId)) {
      this.selectedUsers.push(user);
      // Entferne diesen User aus der verfügbaren Liste
      this.availableUsers = this.availableUsers.filter(
        (u) => u.fireId !== user.fireId
      );
    }
  }

  /**
   * Entfernt einen User aus der Auswahl und fügt ihn wieder zur verfügbaren Liste hinzu.
   */
  removeFromSelection(u: User): void {
    this.selectedUsers = this.selectedUsers.filter(
      (sel) => sel.fireId !== u.fireId
    );
    this.availableUsers.push(u);
  }

  /**
   * Liefert den Avatar-Pfad zurück. In deinem Fall wird einfach der
   * in user.picture gespeicherte Pfad verwendet.
   */
  getUserImagePath(user: User): string {
    return user.picture;
  }

  /**
   * Fügt alle ausgewählten User final dem Channel in Firestore hinzu und schließt das Dialogfenster.
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
   * Schließt den Dialog.
   */
  closeDialog(): void {
    this.dialogRef.close();
  }
}