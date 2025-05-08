import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LogService } from '../../firebase-services/log.service';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-avatar',
  imports: [MatCardModule, CommonModule],
  templateUrl: './edit-avatar.component.html',
  styleUrl: './edit-avatar.component.scss'
})


export class EditAvatarComponent {
  user: any = {};
  userFireId = '';   // Lokale Kopie der Doc‑ID

  avatars: string[] = [
    'img2/avatars/avatar_0.svg',
    'img2/avatars/avatar_1.svg',
    'img2/avatars/avatar_2.svg',
    'img2/avatars/avatar_3.svg',
    'img2/avatars/avatar_4.svg',
    'img2/avatars/avatar_5.svg',
  ];

  constructor(private firebaseSignUp: LogService, private router: Router) {}

  ngOnInit() {
    // falls userDocId via Signup gesetzt wurde:
    this.userFireId = this.firebaseSignUp.userDocId;
  
    // Realtime-Listener auf alle User
    this.firebaseSignUp.users$.subscribe(users => {
      // Suche direkt nach der Document-ID
      const me = users.find(u => u.id === this.userFireId);
      console.log(me);
      
      if (me) {
        // Doc-ID da, Profil laden
        this.loadUserFirstTime();
        // Einmaliges Log:
        console.log('Gefundener Eintrag aus users$:', me);
      }
    });
  }

  async loadUserFirstTime() {
    // this.userFireId ist jetzt garantiert != ''
    const loaded = await this.firebaseSignUp.loadUser(this.userFireId);
    if (loaded) {
      this.user = loaded;
      // sicherheitshalber: überschreibe service.userDocId
      this.firebaseSignUp.userDocId = this.userFireId;
      console.log('Loaded user and set userFireId:', this.userFireId);
    }
  }


  saveAvatar() {
    // userFireId ist jetzt valide
    this.firebaseSignUp.updatePicture(this.user.picture, this.userFireId);
  }


  takeAvatar(avatarNumber: number) {
    this.user.picture = this.avatars[avatarNumber];
  }
}
