import { ChannelService } from './../../../firebase-services/channel.service';
import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { collection, getDocs } from '@angular/fire/firestore';
import { inject } from '@angular/core';
import { MessageService } from '../../../firebase-services/message.service';
import { DataService } from './../../../firebase-services/data.service';
import { SidebarDevspaceComponent } from '../../main-content/sidebar-devspace/sidebar-devspace.component';
import { ChannelMessageComponent } from '../../main-content/message-box/channel-message/channel-message.component';

@Component({
  selector: 'app-logo-and-searchbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logo-and-searchbar.component.html',
  styleUrl: './logo-and-searchbar.component.scss',
})
export class LogoAndSearchbarComponent {
  dataService = inject(DataService);
  searchResults: any[] = [];
  allMessages: any[] = [];
  searchResultsUser: any[] = [];
  searchResultsChannels: any[] = [];
  searchResultsEmail: any[] = [];
  allUsers: any[] = [];
  allChannels: any[] = [];

  constructor(
    private messageService: MessageService,
    private channelService: ChannelService
  ) {
    this.loadMessages();
  }

  async loadMessages() {
    this.allMessages = await this.messageService.getAllMessages();
    // console.log(this.allMessages);
  }

  async ngOnInit() {
    this.messageService.users$.subscribe((users) => {
      this.allUsers = users;
      // console.log('this.allUsers:', this.allUsers);
    });

    this.messageService.channels$.subscribe((channels) => {
      this.allChannels = channels;

    });
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

  selectChannel(item: any, inputElement: HTMLInputElement) {
    this.messageService.updateChannelMessageBox(item.id, item.channelName);
    this.dataService.newMessageBoxIsVisible = false;
    this.dataService.directMessageBoxIsVisible = false;
    this.dataService.channelMessageBoxIsVisible = true;
    this.searchResultsChannels = [];
    inputElement.value = '';
  }

  async selectUser(item: any, inputElement: HTMLInputElement) {
    // console.log('Selected user:', item.fireId);

    this.channelService.setCurrentDirectMessagesChat('directMessages', item.fireId);
    this.searchResultsUser = [];
    inputElement.value = '';
  }


}
