import { Component, inject } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ChannelService } from '../../firebase-services/channel.service';
import { Channel } from '../../models/channel.class';
import { collection, addDoc } from "firebase/firestore";

@Component({
  selector: 'app-channel-overlay',
  imports: [MatDialogModule, MatButtonModule, ],
  templateUrl: './channel-overlay.component.html',
  styleUrl: './channel-overlay.component.scss'
})
export class ChannelOverlayComponent {

  constructor(private firebaseChannels: ChannelService) {}

  addChannel() {
    let channel : Channel = {
          'messageTime' : 0,
          'messageContent' : '',
    };


  }

}

