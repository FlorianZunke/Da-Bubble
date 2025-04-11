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
  isDisabled: boolean = true;
  openEditChannel: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.channelName = data.channelName;
    this.channelDescription = data.channelDescription;
    this.channelCreatedBy = data.channelCreatedBy;
  }

editChannelName(event: MouseEvent): void {
  event.preventDefault();

  this.openEditChannel = true;

  // const viewChannel = document.getElementById('view-channel');
  // const editChannel = document.getElementById('edit-channel');

  // if (viewChannel && editChannel) {
  //   viewChannel.classList.add('d-none');
  //   editChannel.classList.remove('d-none');
  // }
}




saveChannelName(event: MouseEvent): void {
  event.preventDefault();
  console.log('hello');
}

editChannelDescription(event: MouseEvent): void {
  event.preventDefault();

}

// async editChannel() {
  //   const unsub = onSnapshot(this.firebaseChannels.getChannelRef()), (doc) => {
  //     console.log("Current data: ", doc.data());
  // });
  // }
}
