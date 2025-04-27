import { ChannelService } from './../../../firebase-services/channel.service';
import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef, HostListener } from '@angular/core';
import { inject } from '@angular/core';
import { MessageService } from '../../../firebase-services/message.service';
import { DataService } from './../../../firebase-services/data.service';
import { SearchService } from '../../../firebase-services/search.service';
import { SearchToMessageService } from '../../../firebase-services/search-to-message.service';

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

  constructor(
    private messageService: MessageService,
    private channelService: ChannelService,
    private searchService: SearchService,
    private searchToMessageService: SearchToMessageService
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

    console.log('searchResults:', this.searchResults);

  }

  selectChannel(item: any, inputElement: HTMLInputElement) {
    // this.messageService.updateChannelMessageBox(item.id, item.channelName);
    this.searchToMessageService.setChannelId(item.id);
    // this.dataService.newMessageBoxIsVisible = false;
    // this.dataService.directMessageBoxIsVisible = false;
    // this.dataService.channelMessageBoxIsVisible = true;
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

  selectResult(result: any, inputElement: HTMLInputElement) {
    console.log(result);
    if (result.path.startsWith('directMessages')) {
      this.searchToMessageService.setUserId(result.sender.id);
      this.clearSearch();
      inputElement.value = '';
    } else if (result.path.startsWith('channels')) {
      const fireId = this.seperateFireIdFromString(result);
      this.searchToMessageService.setChannelId(fireId);
      this.clearSearch();
      inputElement.value = '';
    }
  }

  seperateFireIdFromString(result:any) {
    const path = result.path;
    const segments = path.split('/');
    const fireId = segments[1];

    return fireId;
  }
}
