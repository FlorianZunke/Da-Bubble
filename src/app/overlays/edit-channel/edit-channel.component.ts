import { Component, Inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChannelService } from '../../firebase-services/channel.service';
import { Channel } from '../../models/channel.class';
import { MessageService } from './../../firebase-services/message.service';
import { doc, onSnapshot } from "firebase/firestore";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-channel',
  imports: [MatDialogModule, MatButtonModule, MatButtonModule, CommonModule, FormsModule],
  templateUrl: './edit-channel.component.html',
  styleUrl: './edit-channel.component.scss'
})
export class EditChannelComponent {
  channelName: string;
  channelDescription: string;
  channelCreatedBy: string;
  channels: any[] = [];
  startPosition: boolean = true;
  startPositionDescription: boolean = true;
  openEditChannel: boolean = false;
  openDescriptionChannel: boolean = false;
  currentChannel: Channel | null = null;
  currentChannelId: string | undefined = '';

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private firebaseChannels: ChannelService) {
    this.channelName = data.channelName;
    this.channelDescription = data.channelDescription;
    this.channelCreatedBy = data.channelCreatedBy;
  }

ngOnInit() {
    this.listenToChannelDoc(this.firebaseChannels.channelId);

  }

listenToChannelDoc(channelId: string): void {
    this.firebaseChannels.listenToChannel(channelId).subscribe((channelData) => {
    this.currentChannel = channelData;
    this.currentChannelId = channelData.id;
  });
}

editChannelName(event: MouseEvent): void {
  event.preventDefault();

  this.startPosition = false;
  this.openEditChannel = !this.openEditChannel;
  this.firebaseChannels.editChannel(this.firebaseChannels.channelId, this.data);
}

editChannelDescription(event: MouseEvent): void {
  event.preventDefault();

  this.startPositionDescription = false;
  this.openDescriptionChannel = !this.openDescriptionChannel;
}

closeEdit() {
  this.startPositionDescription = true;
  this.startPosition = true;
  }
}