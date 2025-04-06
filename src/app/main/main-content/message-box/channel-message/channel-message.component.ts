import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextareaComponent } from '../textarea/textarea.component';
import { ChannelService } from '../../../../firebase-services/channel.service';
import { LogService } from '../../../../firebase-services/log.service';
import { Firestore, onSnapshot } from 'firebase/firestore';
import { MessageService } from '../../../../firebase-services/message.service';

@Component({
  selector: 'app-channel-message',
  imports: [CommonModule, TextareaComponent],
  templateUrl: './channel-message.component.html',
  styleUrl: './channel-message.component.scss',
})
export class ChannelMessageComponent {
  @Input() channelId!: string;
  currentChannelName: string = '';
  currentChannelId: string = '';
  allChannels: any[] = [];

  constructor(
    private channelService: ChannelService,
    private messageService: MessageService
    ) {this.messageService.currentChannel$.subscribe((channel) => {
      this.currentChannelName = channel?.name || '';
      this.currentChannelId = channel?.id || '';
    });
}

  ngOnInit() {
    this.messageService.channels$.subscribe((channels) => {
      this.allChannels = channels;
      console.log('this.allChannels:', this.allChannels[0].channelName);
    });
 
    this.channelService.currentChat$.subscribe((chat) => {
      if (chat && chat.type === 'channel') {
        this.currentChannelId = chat.id;
        this.loadChannelName(chat.id);
      }
    });
  }

  async loadChannelName(channelId: string) {
    const channel = await this.channelService.loadChannel(channelId);
    if (channel) {
      this.currentChannelName = channel.channelName;
    }
  }
}
