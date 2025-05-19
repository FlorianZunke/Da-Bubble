import { CommonModule } from '@angular/common';
import { Component, Input, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from '../../models/user.class';
import { UserOverlayComponent } from '../user-overlay/user-overlay.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MessageService } from '../../firebase-services/message.service';

@Component({
  selector: 'app-show-all-channel-members',
  imports: [CommonModule, MatDialogModule],
  templateUrl: './show-all-channel-members.component.html',
  styleUrl: './show-all-channel-members.component.scss',
})
export class ShowAllChannelMembersComponent {
  usersMap: Record<string, User> = {};
  allUsers: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { channelMembers: any },
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<ShowAllChannelMembersComponent>,
    private messageService: MessageService
  ) {
    this.messageService.getAllUsers().then((users: User[]) => {
      const map: Record<string, User> = {};
      users.forEach((u) => (map[u.id] = u));
      this.usersMap = map;
    });
  }

  async openProfil(userId: string) {
    const user: User | undefined = this.usersMap[userId];
    if (!user) {
      console.error(`User ${userId} nicht gefunden.`);
      return;
    }
    this.dialog.open(UserOverlayComponent, {
      width: '300px', // optional: Größe anpassen
      data: {
        id: user.id,
        fireId: user.fireId, // Firestore‐Dokument‐ID
        name: user.name, // Anzeigename
        email: user.email, // E-Mail‐Adresse
        picture: user.picture, // URL zum Profilbild
        status: user.status, // z. B. "online", "away", etc.
        online: user.online, // Boolean, ob der User gerade online ist
      } as User, // <-- hier kommen alle Felder von User rein
    });
    this.dialogRef.close();
  }
}
