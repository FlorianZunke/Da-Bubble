import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextareaComponent } from '../textarea/textarea.component';
import { ChannelService } from '../../../../firebase-services/channel.service';
import { LogService } from '../../../../firebase-services/log.service';
import { Firestore, onSnapshot } from 'firebase/firestore';
import { MessageService } from '../../../../firebase-services/message.service';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { EditChannelComponent } from './../../../../overlays/edit-channel/edit-channel.component';

@Component({
  selector: 'app-channel-message',
  imports: [CommonModule, TextareaComponent, FormsModule],
  templateUrl: './channel-message.component.html',
  styleUrl: './channel-message.component.scss',
})

export class ChannelMessageComponent {
  @Input() channelId!: string;
  @Input() chatId!: string;
  currentChannelId: string = '';
  selectChannel: string = '';
  messages: any[] = [];
  textInput: string = '';
  currentUser: any = null;
  allChannels: any[] = [];
  readonly dialog = inject(MatDialog);

  constructor(
    private channelService: ChannelService,
    private messageService: MessageService
    ) {
}
  
  ngOnInit() {
    this.messageService.channels$.subscribe((channels) => {
      this.allChannels = channels;
    });
 
    this.channelService.currentChat$.subscribe((chat) => {
      if (chat && chat.type === 'channel') {
        this.currentChannelId = chat.id;
        this.loadChannelName(chat.id);
        this.loadMessages(chat.id);
      }
    });
  }

  get displayChannelName(): string {
      return this.selectChannel || (this.allChannels.length > 0 ? this.allChannels[0].channelName : '');
  }

  async loadChannelName(channelId: string) {
    const channel = await this.channelService.loadChannel(channelId);
    if (channel) {
      this.selectChannel = channel.channelName;
    }
  }

  loadMessages(channelId: string) {
    console.log(channelId);

    this.channelService.listenToChannelMessages(channelId).subscribe(messages => {
      this.messages = messages; // Nachrichten aktualisieren
    });
    console.log(this.messages);
  }

  openEditChannel() {
    this.dialog.open(EditChannelComponent, {
      panelClass: 'custom-dialog-container',
      data: { channelName: this.displayChannelName }
    });
  }
}