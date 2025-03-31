import { Component } from '@angular/core';
import { inject } from '@angular/core';
import { MessageService } from '../../../../firebase-services/message.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-new-message',
  imports: [CommonModule],
  templateUrl: './new-message.component.html',
  styleUrl: './new-message.component.scss',
})
export class NewMessageComponent {
  searchResultsUser: any[] = [];
  searchResultsChannels: any[] = [];
  allUsers: any[] = [];
  allChannels: any[] = [];
  private messageService = inject(MessageService);

  constructor() {
    this.loadUserlist();
    this.loadChannellist();
  }

  async loadUserlist() {
    this.allUsers = await this.messageService.getAllUsers();
    console.log(this.allUsers, 'allUsers');
  }

  async loadChannellist() {
    this.allChannels = await this.messageService.getAllChannels();
    console.log(this.allChannels, 'alle Kanäle');
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
      return;
    } else if (searchTerm.startsWith('#')) {
      this.searchResultsChannels = this.allChannels;
      if (searchTerm.length > 1) {
        const query = searchTerm.substring(1);
        this.searchResultsChannels = this.searchResultsChannels.filter((channel) =>
          channel?.channelName?.toLowerCase().includes(query)
        );
      }
    }
  }
}
