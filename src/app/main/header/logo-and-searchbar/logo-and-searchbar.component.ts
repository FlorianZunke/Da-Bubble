import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { collection, getDocs } from '@angular/fire/firestore';
import { inject } from '@angular/core';
import { MessageService } from '../../../firebase-services/message.service';

@Component({
  selector: 'app-logo-and-searchbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logo-and-searchbar.component.html',
  styleUrl: './logo-and-searchbar.component.scss',
})
export class LogoAndSearchbarComponent {
  searchResults: any[] = [];
  allMessages: any[] = [];
  searchResultsUser: any[] = [];
  searchResultsChannels: any[] = [];
  searchResultsEmail: any[] = [];
  allUsers: any[] = [];
  allChannels: any[] = [];

  constructor(private messageService: MessageService) {
    this.loadMessages();
  }

  async loadMessages() {
    this.allMessages = await this.messageService.getAllMessages();
    console.log(this.allMessages);
  }

  ngOnInit() {
    this.messageService.users$.subscribe((users) => {
      this.allUsers = users;
      console.log('this.allUsers:', this.allUsers);
    });

    this.messageService.channels$.subscribe(
      (channels) => (this.allChannels = channels)
    );
  }

  onSearch(event: any) {
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
      this.searchResults = [];
      return;
    } else if (searchTerm.startsWith('#')) {
      this.searchResultsChannels = this.allChannels;
      if (searchTerm.length > 1) {
        const query = searchTerm.substring(1);
        this.searchResultsChannels = this.searchResultsChannels.filter(
          (channel) => channel?.channelName?.toLowerCase().includes(query)
        );
      }
    } else if (searchTerm.length > 2) {
      this.searchResultsEmail = this.allUsers;
      this.searchResultsEmail = this.searchResultsEmail.filter((user) =>
        user?.email?.toLowerCase().includes(searchTerm)
      );
      this.searchResults = this.allMessages.filter(
        (msg) =>
          msg?.content?.toLowerCase().includes(searchTerm) ||
          msg?.user?.toLowerCase().includes(searchTerm)
      );
    }
  }
}
