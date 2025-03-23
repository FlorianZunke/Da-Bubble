import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ChannelService } from '../../firebase-services/channel.service';
import { Channel } from '../../models/channel.class';
import { addDoc, serverTimestamp } from "firebase/firestore";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-user-to-channel',
  imports: [MatDialogModule, MatButtonModule, ],
  templateUrl: './add-user-to-channel.component.html',
  styleUrl: './add-user-to-channel.component.scss'
})
export class AddUserToChannelComponent {

  channel: Channel = new Channel;

  constructor(private firebaseChannels: ChannelService) { }

}
