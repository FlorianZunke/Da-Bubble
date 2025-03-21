import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { LogService } from '../firebase-services/log.service';
import { User } from '../models/user.class';

@Component({
  selector: 'app-choose-avatar',
  imports: [MatCardModule],
  templateUrl: './choose-avatar.component.html',
  styleUrl: './choose-avatar.component.scss'
})
export class ChooseAvatarComponent {

  user:any = {};
  userFireId:string = '';


  constructor( private firebaseSignUp: LogService) {
  }

  ngOnInit() {
    this.userFireId = this.firebaseSignUp.userDocId;
    console.log('hurra', this.userFireId);
    this.loadUserFirstTime();
  }

  async loadUserFirstTime() {
    this.user = await this.firebaseSignUp.loadUser(this.userFireId);
    console.log('user', this.user);
  }

}
