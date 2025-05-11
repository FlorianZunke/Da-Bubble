import { Component } from '@angular/core';
import { ChannelService } from '../firebase-services/channel.service';
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
  idOfficeTeam: string = 'Sne8NpUlwjSPCKRlSRB8';
  idEntwicklerteam: string = 'FOkUjWO1xvcufngscN3t';

  avatars: string[] = [
    'img2/avatars/avatar_0.svg',
    'img2/avatars/avatar_1.svg',
    'img2/avatars/avatar_2.svg',
    'img2/avatars/avatar_3.svg',
    'img2/avatars/avatar_4.svg',
    'img2/avatars/avatar_5.svg',
  ];

  constructor(
    private channelService: ChannelService,
    private firebaseSignUp: LogService,
    private router: Router
  ) {}

  ngOnInit() {
    this.userFireId = this.firebaseSignUp.userDocId;
    this.loadUserFirstTime();
  }

  async loadUserFirstTime() {
    this.user = await this.firebaseSignUp.loadUser(this.userFireId); 
  }

  takeAvatar(avatarNumber: number) {
    this.user.picture = this.avatars[avatarNumber];
  }

  saveAvatar() {
    this.firebaseSignUp.updatePicture(this.user.picture, this.userFireId);
    this.user.fireId = this.userFireId;
    this.channelService.addUserToChannel(this.idOfficeTeam, this.user);
    this.channelService.addUserToChannel(this.idEntwicklerteam, this.user);
    this.router.navigate(['login'])
  }

  goBack() {
    this.router.navigate(['sign-in']);
  }
}