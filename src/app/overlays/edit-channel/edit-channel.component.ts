import { Component, Inject, OnInit } from '@angular/core';
import { AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../firebase-services/data.service';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Channel } from '../../models/channel.class';
import { ChannelService } from '../../firebase-services/channel.service';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

import { take } from 'rxjs/operators';

@Component({
  selector: 'app-edit-channel',
  imports: [MatDialogModule, MatButtonModule, MatButtonModule, CommonModule, FormsModule],
  templateUrl: './edit-channel.component.html',
  styleUrl: './edit-channel.component.scss'
})

export class EditChannelComponent implements AfterViewInit, OnInit {
  @ViewChild('channelDescriptionRef') channelDescriptionRef!: ElementRef;

  channelName: string;
  channelDescription: string;
  channelCreatedBy: string;
  channels: any[] = [];
  channel: Channel = new Channel;
  channelExists: boolean = false;
  startPosition: boolean = true;
  startPositionDescription: boolean = true;
  openEditChannel: boolean = false;
  openDescriptionChannel: boolean = false;
  currentChannel: Channel | null = null;
  currentChannelId: string | undefined = '';

constructor(
  @Inject(MAT_DIALOG_DATA) public data: any, 
  private firebaseChannels: ChannelService,
  private dataService: DataService,
  private dialogRef: MatDialogRef<EditChannelComponent>,
  )
  {
    this.channelName = data.channelName;
    this.channelDescription = data.channelDescription;
    this.channelCreatedBy = data.channelCreatedBy;
}

ngOnInit() {
    this.listenToChannelDoc(this.firebaseChannels.channelId);
}

checkChannelExists(): void {
  this.channelExists = false;
  
  for (let i = 0; i < this.firebaseChannels.loggedUserChannels.length; i++) {
    if (this.data.channelName === this.firebaseChannels.loggedUserChannels[i]['channelName']) {
      this.channelExists = true;
    } 
  }
} 

ngAfterViewInit() {
  setTimeout(() => {
    const textarea = this.channelDescriptionRef?.nativeElement;
    if (textarea) {
      this.adjustTextareaHeight(textarea);
    }
  });
}

setDynamicTextareaHeight() {
  const textarea = this.channelDescriptionRef.nativeElement;
  textarea.style.height = 'auto';

  if (textarea.scrollHeight < 65) {
    textarea.style.height = '247px';
  } else if (textarea.scrollHeight < 90) {
    textarea.style.height = '265px';
  }
}

listenToChannelDoc(channelId: string): void {
    this.firebaseChannels.listenToChannel(channelId).subscribe((channelData) => {
    this.currentChannel = channelData;
    this.currentChannelId = channelData.id;
  });
}

async editChannelName(event: MouseEvent) {
  event.preventDefault();

  this.startPosition = false;
  this.openEditChannel = !this.openEditChannel;

  if (!this.openEditChannel && this.channelName !== this.data.channelName) {
    this.firebaseChannels.editChannel(this.firebaseChannels.channelId, this.data)
  }
}

async editChannelDescription(event: MouseEvent) {
  event.preventDefault();

  this.startPositionDescription = false;

  if (this.openDescriptionChannel && this.channelDescription !== this.data.channelDescription) {
    this.setDynamicTextareaHeight();
    try {
      await this.firebaseChannels.editChannel(this.firebaseChannels.channelId, this.data);
    } catch (error) {
      console.error('Fehler beim Bearbeiten des Kanals:', error);
        return; 
    }
  }

  this.openDescriptionChannel = !this.openDescriptionChannel;
}

leaveChannel() {
  this.firebaseChannels.listenToChannel(this.firebaseChannels.channelId)
  .pipe(take(1))
  .subscribe((channelData) => {
    const loggedUser = this.dataService.getLoggedUser();
    const memberToRemove = channelData.members.find(member => member.fireId === loggedUser?.fireId);
    
    if (memberToRemove) {
      this.firebaseChannels.removeUserFromChannel(this.firebaseChannels.channelId, memberToRemove);
      console.log('User wurde entfernt:', memberToRemove);
    } else {
      console.log('User war nicht Mitglied des Channels.');
    }
  });
  this.closeEdit();
}

adjustTextareaHeight(textarea: HTMLTextAreaElement): void {
  textarea.style.height = 'auto';
  
  const lineHeightPx = parseFloat(getComputedStyle(textarea).lineHeight || "24");
  const numberOfLines = Math.floor(textarea.scrollHeight / lineHeightPx);
  
  const baseRem = 2;
  const newHeightRem = baseRem + (numberOfLines - 1) * 1.5;
  textarea.style.height = `${newHeightRem}rem`;
}

onModelChange(value: string) {
  const textarea = this.channelDescriptionRef?.nativeElement;
  
  if (textarea) {
      this.adjustTextareaHeight(textarea);
    }
  }

closeEdit() {
    this.startPositionDescription = true;
    this.startPosition = true;
    this.dialogRef.close();
  }
}