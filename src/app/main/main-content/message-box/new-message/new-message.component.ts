import { Component } from '@angular/core';
import { ChannelService } from '../../../../firebase-services/channel.service';
import { CommonModule } from '@angular/common';
import { ChannelMessageComponent } from "../channel-message/channel-message.component";
import { DirectMessageComponent } from "../direct-message/direct-message.component";
import { LogService } from '../../../../firebase-services/log.service';
import { inject } from '@angular/core';
import { MessageService } from '../../../../firebase-services/message.service';
import { TextareaComponent } from '../textarea/textarea.component';

@Component({
  selector: 'app-new-message',
  imports: [CommonModule, ChannelMessageComponent, DirectMessageComponent, TextareaComponent],
  templateUrl: './new-message.component.html',
  styleUrl: './new-message.component.scss',
})
export class NewMessageComponent {
  currentChat: { type: 'channel' | 'direct', id: string } | null = null;
  currentUserId = "user1Id"; // Setze hier den eingeloggten Benutzer
  searchResultsUser: any[] = [];
  searchResultsChannels: any[] = [];
  searchResultsEmail: any[] = [];
  allUsers: any[] = [];
  allChannels: any[] = [];

  constructor(private channelService: ChannelService, private messageService : MessageService) {
    this.channelService.currentChat$.subscribe(chat => {
      this.currentChat = chat;
    });
  }

  async openDirectChat(userId: string) {
    const chatId = await this.channelService.getOrCreateDirectChat(this.currentUserId, userId);
    this.currentChat = { type: 'direct', id: chatId };
  }

  // private messageService = inject(MessageService);
    // this.loadUserlist();
    // this.loadChannellist();
 

  // async loadUserlist() {
  //   this.allUsers = await this.messageService.getAllUsers();
  //   console.log(this.allUsers, 'allUsers');
  // }

  // async loadChannellist() {
  //   this.allChannels = await this.messageService.getAllChannels();
  //   console.log(this.allChannels, 'alle Kanäle');
  // }

  ngOnInit() {
    this.messageService.users$.subscribe(users => this.allUsers = users);
    this.messageService.channels$.subscribe(channels => this.allChannels = channels);
  }

  searchUserorChannel(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    if (searchTerm.startsWith('@')) {
      this.searchResultsUser = this.allUsers;
      if (searchTerm.length > 1) {
        const query = searchTerm.substring(1);
        this.searchResultsUser = this.searchResultsUser.filter((user) =>
          user?.name?.toLowerCase().includes(query)
        );
      }
    } else if (!searchTerm) {
      this.searchResultsChannels = [];
      this.searchResultsUser = [];
      this.searchResultsEmail = [];
      return;
    } else if (searchTerm.startsWith('#')) {
      this.searchResultsChannels = this.allChannels;
      if (searchTerm.length > 1) {
        const query = searchTerm.substring(1);
        this.searchResultsChannels = this.searchResultsChannels.filter((channel) =>
          channel?.channelName?.toLowerCase().includes(query)
        );
      }
    } else if (searchTerm.length > 2) {
      this.searchResultsEmail = this.allUsers;
      this.searchResultsEmail = this.searchResultsEmail.filter((user) =>
        user?.email?.toLowerCase().includes(searchTerm)
      );
    }
  }
}
