import { Component, Inject, Input } from '@angular/core';
import { ChannelService } from '../../firebase-services/channel.service';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MessageService } from './../../firebase-services/message.service';
import { doc, onSnapshot } from "firebase/firestore";
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-edit-channel',
  imports: [MatDialogModule, MatButtonModule, CommonModule],
  templateUrl: './edit-channel.component.html',
  styleUrl: './edit-channel.component.scss'
})
export class EditChannelComponent {
  channelName: string;
  channelDescription: string;
  channelCreatedBy: string;
  startPosition: boolean = true;
  openEditChannel: boolean = false;
  openDescriptionChannel: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.channelName = data.channelName;
    this.channelDescription = data.channelDescription;
    this.channelCreatedBy = data.channelCreatedBy;
  }

editChannelName(event: MouseEvent): void {
  event.preventDefault();

  this.startPosition = false;
  this.openEditChannel = !this.openEditChannel;
}

saveChannelName(event: MouseEvent): void {
  event.preventDefault();
  console.log('hello');
}

editChannelDescription(event: MouseEvent): void {
  event.preventDefault();

  this.openDescriptionChannel = !this.openDescriptionChannel;
}

closeEdit() {
  this.startPosition = true;
  }
}
