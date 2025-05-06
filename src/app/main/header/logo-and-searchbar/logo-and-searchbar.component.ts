import { ChannelService } from './../../../firebase-services/channel.service';
import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef, HostListener } from '@angular/core';
import { inject } from '@angular/core';
import { MessageService } from '../../../firebase-services/message.service';
import { DataService } from './../../../firebase-services/data.service';
import { SearchService } from '../../../firebase-services/search.service';
import { SearchToMessageService } from '../../../firebase-services/search-to-message.service';
import { Observable, of } from 'rxjs';
import { SidebarThreadComponent } from '../../main-content/sidebar-thread/sidebar-thread.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logo-and-searchbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logo-and-searchbar.component.html',
  styleUrl: './logo-and-searchbar.component.scss',
})
export class LogoAndSearchbarComponent {
  dataService = inject(DataService);

  @ViewChild('searchContainer') searchContainer!: ElementRef;
  @ViewChild('searchInput') searchInput!: ElementRef;

  searchResults: any[] = [];
  searchResultsUser: any[] = [];
  searchResultsChannels: any[] = [];
  searchResultsEmail: any[] = [];

  allUsers: any[] = [];
  allChannels: any[] = [];
  allMessages: any[] = [];

  searchActiv = false;
  replies$: Observable<any[]> = of([]);

  constructor(
    private messageService: MessageService,
    private channelService: ChannelService,
    private searchService: SearchService,
    private searchToMessageService: SearchToMessageService,
    private router: Router
  ) {
    // this.loadMessages();
    this.messageService.updateMessages();
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

    this.messageService.messages$.subscribe((messages) => {
      this.allMessages = messages;
    });
  }

  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: MouseEvent) {
    const clickedInside = this.searchContainer.nativeElement.contains(
      event.target
    );
    if (!clickedInside) {
      this.searchActiv = false;
      this.searchInput.nativeElement.value = '';
      this.clearSearch();
    }
  }

  onSearch(event: any) {
    const term = event.target.value;
    const results = this.searchService.performFullSearch(
      term,
      this.allUsers,
      this.allChannels,
      this.allMessages
    );

    this.searchResultsUser = results.users;
    this.searchResultsChannels = results.channels;
    this.searchResultsEmail = results.emails;
    this.searchResults = results.messages;

    // console.log('searchResults:', this.searchResults);
  }

  async selectChannel(item: any, inputElement: HTMLInputElement) {
    this.searchToMessageService.setChannelId(item.id);
    const channelIndex = this.findIndexOfChannel(item.channelName);
      setTimeout(() => {
        const element = document.getElementById(channelIndex.toString());
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    this.searchResultsChannels = [];
    inputElement.value = '';
  }

  async selectUser(item: any, inputElement: HTMLInputElement) {
    this.searchToMessageService.setUserId(item.id);
    // this.channelService.setCurrentDirectMessagesChat('directMessages', item.fireId);
    this.searchResultsUser = [];
    this.searchResultsEmail = [];
    this.searchResultsChannels = [];
    inputElement.value = '';
  }

  clearSearch() {
    this.searchResults = [];
    this.searchResultsUser = [];
    this.searchResultsChannels = [];
    this.searchResultsEmail = [];
  }

  async selectResult(result: any, inputElement: HTMLInputElement) {
    console.log(result);
    if (result.path.startsWith('directMessages')) {
      const chatId = await this.getFireIdPrivatChat(result);
      const chat = await this.messageService.getChatParticipants(chatId);

      if (chat) {
        const fireIdRecipient = chat['participants'][1];
        const selectedUser = await this.messageService.loadSingleUserData(
          fireIdRecipient
        );
        if (selectedUser) {
          console.log('nachrichtenempänger', selectedUser);
          this.channelService.setSelectedChatPartner(selectedUser);
          this.dataService.setChatId(chatId);
          this.channelService.setCurrentDirectMessagesChat(chatId);

          this.dataService.newMessageBoxIsVisible = false;
          this.dataService.directMessageBoxIsVisible = true;
          this.dataService.channelMessageBoxIsVisible = false;

          this.searchToMessageService.setUserId(selectedUser['id']);


        }
      }

      inputElement.value = '';
      this.clearSearch();

    } else if (result.path.startsWith('channels')) {
      const ChannelFireId = this.getFireIdChannel(result);
      this.searchToMessageService.setChannelId(ChannelFireId);
      setTimeout(() => {
        const element = document.getElementById(result.id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);

      if (result.path.includes('replies')) {
        const ChannelFireId = this.getFireIdChannel(result);
        const startThreadMesageId = this.getFireIdChannelMessage(result);
        // const startMessage = await
        setTimeout(() => {
          const element = document.getElementById(startThreadMesageId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 500);

        const threadBase = await this.messageService.loadSingleChatMesasage(
          ChannelFireId,
          startThreadMesageId
        );
        this.dataService.setCurrentThreadMessage({
          ...threadBase,
          channelId: ChannelFireId,
        });

        this.dataService.sidebarThreadIsVisible = true;
        console.log('alle antworten', threadBase);
      }

      this.clearSearch();
      inputElement.value = '';
    }
  }

  getFireIdChannel(result: any) {
    const path = result.path;
    const segments = path.split('/');
    const fireId = segments[1];

    return fireId;
  }

  getFireIdChannelMessage(result: any) {
    const path = result.path;
    const segments = path.split('/');
    const fireId = segments[3];

    return fireId;
  }

  getFireIdThreadMesage(result: any) {
    const path = result.path;
    const segments = path.split('/');
    const fireId = segments[5];
    return fireId;
  }

  getFireIdPrivatChat(result: any) {
    const path = result.path;
    const segments = path.split('/');
    const fireId = segments[1];
    return fireId;
  }

  openDevspace() {
    this.router.navigate(['/main']);
  }

  findIndexOfChannel(channelName: string) {
    const index = this.allChannels.findIndex((channel) => channel.channelName === channelName);
    if (index === -1) {
      console.warn('❌ Keine Channelübereinstimmung gefunden');
      return -1; // Benutzer nicht gefunden
    }
    return index;
  }

}


