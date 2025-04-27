import { Component } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ChannelService } from '../../firebase-services/channel.service';
import { Channel } from '../../models/channel.class';
import { addDoc, serverTimestamp } from "firebase/firestore";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddAllUsersComponent } from './add-all-users/add-all-users.component';

@Component({
  selector: 'app-channel-overlay',
  imports: [CommonModule, MatDialogModule, MatButtonModule, FormsModule],
  templateUrl: './channel-overlay.component.html',
  styleUrl: './channel-overlay.component.scss'
})
export class ChannelOverlayComponent {

  channel: Channel = new Channel;

  constructor(
    private firebaseChannels: ChannelService, 
    private dialog: MatDialog
  ) { }

  addChannel() {
    this.firebaseChannels.addChannel(this.channel);
  }

  openAddAllUsers(): void {
      this.dialog.open(AddAllUsersComponent, {
        panelClass: 'add-user-container',
      });
    }
}

