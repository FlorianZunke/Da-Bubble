import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { LogService } from '../firebase-services/log.service';
import { User } from '../models/user.class';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-choose-avatar',
  imports: [MatCardModule, CommonModule],
  templateUrl: './choose-avatar.component.html',
  styleUrl: './choose-avatar.component.scss',
})
export class ChooseAvatarComponent {
  user: any = {};
  userFireId: string = '';

  avatars: string[] = [
    'img2/avatars/avatar_0.svg',
    'img2/avatars/avatar_1.svg',
    'img2/avatars/avatar_2.svg',
    'img2/avatars/avatar_3.svg',
    'img2/avatars/avatar_4.svg',
    'img2/avatars/avatar_5.svg',
  ];

  constructor(private firebaseSignUp: LogService,private router: Router) {}

  ngOnInit() {
    this.userFireId = this.firebaseSignUp.userDocId;
    // console.log('hurra', this.userFireId);
    this.loadUserFirstTime();
  }

  async loadUserFirstTime() {
    this.user = await this.firebaseSignUp.loadUser(this.userFireId);
    // console.loSg('user', this.user);
  }

  takeAvatar(avatarNumber: number) {
    this.user.picture = this.avatars[avatarNumber];
  }

  saveAvatar() {
    // console.log('fire-id', this.userFireId);
    this.firebaseSignUp.updatePicture(this.user.picture, this.userFireId);
    this.router.navigate(['/testLogin'])// this.router.navigate(['/main']);
  }
}
