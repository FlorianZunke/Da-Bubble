import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextareaComponent } from '../textarea/textarea.component';
import { ChannelService } from '../../../../firebase-services/channel.service';
import { LogService } from '../../../../firebase-services/log.service';
import { Firestore, onSnapshot } from 'firebase/firestore';

@Component({
  selector: 'app-channel-message',
  imports: [CommonModule, TextareaComponent],
  templateUrl: './channel-message.component.html',
  styleUrl: './channel-message.component.scss'
})
export class ChannelMessageComponent {
  @Input() channelId!: string;
  currentChannelName: string = '';
  currentChannelId: string = '';

  constructor(private channelService: ChannelService) {
    
  }

  ngOnInit() {
    this.channelService.currentChat$.subscribe(chat => {
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
