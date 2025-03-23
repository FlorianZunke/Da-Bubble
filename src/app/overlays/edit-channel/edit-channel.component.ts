import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ChannelService } from '../../firebase-services/channel.service';
import { Channel } from '../../models/channel.class';
import { doc, onSnapshot } from "firebase/firestore";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-channel',
  imports: [MatDialogModule, MatButtonModule, CommonModule],
  templateUrl: './edit-channel.component.html',
  styleUrl: './edit-channel.component.scss'
})
export class EditChannelComponent {

  channel: Channel = new Channel;

  constructor(private firebaseChannels: ChannelService) { }

  async editChannel() {
  //   const unsub = onSnapshot(this.firebaseChannels.getChannelRef()), (doc) => {
  //     console.log("Current data: ", doc.data());
  // });
  }
}
