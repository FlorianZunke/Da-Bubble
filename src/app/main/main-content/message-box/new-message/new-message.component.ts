import { Component,Input} from '@angular/core';
import { ChannelService } from '../../../../firebase-services/channel.service';
import { CommonModule } from '@angular/common';
import { LogService } from '../../../../firebase-services/log.service';
import { inject } from '@angular/core';
import { MessageService } from '../../../../firebase-services/message.service';
import { TextareaComponent } from '../textarea/textarea.component';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../../firebase-services/data.service';
import { SearchService } from '../../../../firebase-services/search.service';
import { SearchToMessageService } from '../../../../firebase-services/search-to-message.service';

@Component({
  selector: 'app-new-message',
  imports: [CommonModule, TextareaComponent, FormsModule],
  templateUrl: './new-message.component.html',
  styleUrl: './new-message.component.scss',
})
export class NewMessageComponent {

  dataService = inject(DataService);
  searchResultsUser: any[] = [];
  searchResultsChannels: any[] = [];
  searchResultsEmail: any[] = [];
  allUsers: any[] = [];
  allChannels: any[] = [];


  currentChat: { type: 'channel' | 'directMessages'; id: string } | null = null;
  currentUserId = 'user1Id'; // Setze hier den eingeloggten Benutzer
  currentUser: any = null;
  textInput: string = '';
  @Input() chatId!: string;

  constructor(
    public channelService: ChannelService,
    private messageService: MessageService,
    private searchService: SearchService,
    private searchToMessageService : SearchToMessageService

  ) {
    this.channelService.currentChat$.subscribe((chat) => {
      this.currentChat = chat; //null nach dem laden
    });
    // console.log(
    //   'die ganzen User Parameter sind:',
    //   this.currentUserId,
    //   this.currentUser // Macht er aber noch nicht
    // );
    // console.log(
    //   'die ganzen chat Parameter sind:',
    //   this.currentChat, //null nach dem laden
    //   this.chatId //undefined nach dem laden
    // );
  }

  async openDirectChat(userId: string) {
    console.log('openDirectChat called with', userId);
    const chatId = await this.channelService.getOrCreateDirectChat(
      this.currentUserId,
      userId
    );
    console.log('Direct Chat ID:', chatId);
    this.channelService.setCurrentDirectMessagesChat('directMessages', chatId);
  }

  sendDirectMessage(event: { chatId: string; senderId: string; text: string }) {
    this.channelService.sendDirectMessage(
      event.chatId,
      this.currentUser,
      event.text
    );
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

  async ngOnInit() {
    this.messageService.users$.subscribe((users) => {
      this.allUsers = users;
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
    }
  }

  selectChannel(item: any, inputElement: HTMLInputElement) {
    this.searchToMessageService.setChannelId(item.id);
    // this.dataService.newMessageBoxIsVisible = false;
    // this.dataService.directMessageBoxIsVisible = false;
    // this.dataService.channelMessageBoxIsVisible = true;
    this.searchResultsChannels = [];
    inputElement.value = '';
  }

  selectUser(item: any, inputElement: HTMLInputElement) {
    this.searchToMessageService.setUserId(item.id);
    this.searchResultsUser = [];
    inputElement.value = '';
  }
}
