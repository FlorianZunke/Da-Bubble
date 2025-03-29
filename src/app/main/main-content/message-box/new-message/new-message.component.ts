import { Component } from '@angular/core';
import { ChannelService } from '../../../../firebase-services/channel.service';
import { CommonModule } from '@angular/common';
import { ChannelMessageComponent } from "../channel-message/channel-message.component";
import { DirectMessageComponent } from "../direct-message/direct-message.component";

@Component({
  selector: 'app-new-message',
  imports: [CommonModule, ChannelMessageComponent, DirectMessageComponent],
  templateUrl: './new-message.component.html',
  styleUrl: './new-message.component.scss'
})
export class NewMessageComponent {
  currentChat: { type: 'channel' | 'direct', id: string } | null = null;

  constructor(private channelService: ChannelService) {
    this.channelService.currentChat$.subscribe(chat => {
      this.currentChat = chat;
    });
  }
}
