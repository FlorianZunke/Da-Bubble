import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LogService } from '../../firebase-services/log.service';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { User } from '../../models/user.class';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { DataService } from '../../firebase-services/data.service';

@Component({
  selector: 'app-edit-avatar',
  imports: [MatCardModule, CommonModule],
  templateUrl: './edit-avatar.component.html',
  styleUrl: './edit-avatar.component.scss',
})
export class EditAvatarComponent {
  // user: any = {};
  userFireId = ''; // Lokale Kopie der Doc‑ID
  loggedUser: any = {};
  readonly dialog = inject(MatDialog);

  avatars: string[] = [
    'img/avatars/avatar_0.svg',
    'img/avatars/avatar_1.svg',
    'img/avatars/avatar_2.svg',
    'img/avatars/avatar_3.svg',
    'img/avatars/avatar_4.svg',
    'img/avatars/avatar_5.svg',
  ];

  constructor(
    private firebaseSignUp: LogService,
    private dataService: DataService,
    private dialogRef: MatDialogRef<EditAvatarComponent>
  ) {}

  async ngOnInit() {
    this.loggedUser = await this.loadlogedUserFromSessionStorage();
  }

  async saveAvatar() {
    // 1. Firebase updaten
    await this.firebaseSignUp.updatePicture(
      this.loggedUser.picture,
      this.loggedUser.fireId
    );

    // 2. SessionStorage updaten
    sessionStorage.setItem('user', JSON.stringify(this.loggedUser));

    // 3. Observable im DataService pushen
    this.dataService.setLoggedUser(this.loggedUser);

    // 4. Dialog schließen
    this.dialogRef.close();
  }

  takeAvatar(avatarNumber: number) {
    this.loggedUser.picture = this.avatars[avatarNumber];
  }

  async loadlogedUserFromSessionStorage() {
    const user = sessionStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      return parsedUser;
    } else {
      // console.log('No user found in session storage.');
      return null;
    }
  }
}
