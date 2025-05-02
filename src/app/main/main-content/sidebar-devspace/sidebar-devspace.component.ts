import { Component, inject, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from './../../../firebase-services/data.service';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ChannelOverlayComponent } from '../../../overlays/channel-overlay/channel-overlay.component';
import { ChannelService } from '../../../firebase-services/channel.service';
import { Router } from '@angular/router';
import { LogService } from '../../../firebase-services/log.service';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { DirektMessageService } from '../../../firebase-services/direkt-message.service';
import { SearchToMessageService } from '../../../firebase-services/search-to-message.service';
import { SearchService } from '../../../firebase-services/search.service';
import { MessageService } from '../../../firebase-services/message.service';

@Component({
  selector: 'app-sidebar-devspace',
  imports: [CommonModule, MatButtonModule, FormsModule],
  templateUrl: './sidebar-devspace.component.html',
  styleUrl: './sidebar-devspace.component.scss',
})
export class SidebarDevspaceComponent {
  readonly dialog = inject(MatDialog);
  channelFireId: any = '';
  loadedChannel: any = {};
  channel: any = {};
  channels: any[] = [];
  directChat: any = [];
  users: any[] = [];
  activeChannelIndex: number = 0;
  selectedUserIndex: number = -1;

  allUsers: any[] = [];
  allChannels: any[] = [];
  allMessages: any[] = [];

  @ViewChild('searchContainer') searchContainer!: ElementRef;
  @ViewChild('searchInput') searchInput!: ElementRef;

  searchResults: any[] = [];
  searchResultsUser: any[] = [];
  searchResultsChannels: any[] = [];
  searchResultsEmail: any[] = [];
  searchActiv = false;

  constructor(
    private firebaseChannels: ChannelService,
    private router: Router,
    private logService: LogService,
    public dataService: DataService,
    private directMessagesService: DirektMessageService,
    private searchToMessageService: SearchToMessageService,
    private searchService: SearchService,
    private messageService: MessageService,
  ) { 
    this.loadMessages();
  }

  async loadMessages() {
    this.allMessages = await this.messageService.getAllMessages();
    // console.log(this.allMessages);
  }

  toggleChannel() {
    this.dataService.channelMenuIsHidden =
      !this.dataService.channelMenuIsHidden;
    const toggleChannel = document.getElementById('channel');
    if (toggleChannel) {
      toggleChannel.classList.toggle('d-none');
    }
  }

  toggleUserChannel() {
    this.dataService.directMessageMenuIsHidden =
      !this.dataService.directMessageMenuIsHidden;
    const toggleUserChannel = document.getElementById('user-channel');
    if (toggleUserChannel) {
      toggleUserChannel.classList.toggle('d-none');
    }
  }

  openDialog() {
    this.dialog.open(ChannelOverlayComponent, {
      panelClass: 'custom-dialog-container',
    });
  }

  ngOnInit() {
    this.firebaseChannels.channels$.subscribe((channels) => {
      this.channels = channels; // Automatische Updates empfangen
    });

    this.logService.users$.subscribe((users) => {
      this.users = users; // Benutzerliste aus dem Service abrufen
     });
    this.firebaseChannels.currentDirectChat$.subscribe((chat) => {
      this.directChat = chat; // Automatische Updates empfangen
    });

    this.searchToMessageService.userId$.subscribe((userId) => {
      this.selectUser(userId);
    });

    this.searchToMessageService.channelId$.subscribe((channelId) => {
      this.selectChannel(channelId);
      console.log(this.channels);
      for (let singleChannel of this.channels) {
        if (singleChannel.id === channelId) {
          this.activeChannelIndex = this.channels.indexOf(singleChannel);
          // console.log('Channel gefunden:', channel);
          break; // Schleife beenden, wenn der Kanal gefunden wurde
        }
      }
    });

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

  selectChannel(channelId: string) {
    this.channelFireId = channelId;
    this.firebaseChannels.channelId = channelId;
    this.loadChannelFirstTime(this.channelFireId);

    this.dataService.newMessageBoxIsVisible = false;
    this.dataService.directMessageBoxIsVisible = false;
    this.dataService.channelMessageBoxIsVisible = true;
  }

  async loadChannelFirstTime(channelId: string) {
    this.channel = await this.firebaseChannels.loadChannel(this.channelFireId);
    this.firebaseChannels.setCurrentChannelChat(channelId);
  }

  async selectUser(userId: string) {
    try {
      const currentUser = await firstValueFrom(this.dataService.logedUser$);
      const selectedUser = this.users.find((u) => u.id === userId);
      // console.log('currentUser:', currentUser.fireId);
      // console.log('selectedUser:', selectedUser.fireId);
      if (!currentUser || !selectedUser) {
        console.warn('❌ currentUser oder selectedUser ist null!');
        return;
      }

      this.firebaseChannels.setSelectedChatPartner(selectedUser);

      const chatId = await this.firebaseChannels.getOrCreateDirectChat(
        currentUser.fireId,
        selectedUser.fireId
      );
      // console.log('💬 chatId:', chatId);
      this.dataService.setChatId(chatId);
      this.firebaseChannels.setCurrentDirectMessagesChat(chatId);

      this.dataService.newMessageBoxIsVisible = false;
      this.dataService.directMessageBoxIsVisible = true;
      this.dataService.channelMessageBoxIsVisible = false;
    } catch (error) {
      console.error('Fehler beim Laden des aktuellen Benutzers:', error);
    }
  }

  setChannelActive(i: number) {
    this.activeChannelIndex = i;
  }

  setSelectedUser(i: number) {
    this.selectedUserIndex = i;
  }

  openNewMessage() {
    this.dataService.newMessageBoxIsVisible = true;
    this.dataService.directMessageBoxIsVisible = false;
    this.dataService.channelMessageBoxIsVisible = false;
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
    console.log(this.searchResults);
    
  }

  selectedChannel(item: any, inputElement: HTMLInputElement) {
    // this.messageService.updateChannelMessageBox(item.id, item.channelName);
    this.searchToMessageService.setChannelId(item.id);
    // this.dataService.newMessageBoxIsVisible = false;
    // this.dataService.directMessageBoxIsVisible = false;
    // this.dataService.channelMessageBoxIsVisible = true;
    this.searchResultsChannels = [];
    inputElement.value = '';
  }

  async selectedUser(item: any, inputElement: HTMLInputElement) {
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
      this.searchToMessageService.setUserId(result.senderId.id);
      this.clearSearch();
      inputElement.value = '';
    } else if (result.path.startsWith('channels')) {
      const fireId = this.seperateFireIdFromString(result);
      this.searchToMessageService.setChannelId(fireId);
      this.clearSearch();
      inputElement.value = '';
    }
  }

  seperateFireIdFromString(result: any) {
    const path = result.path;
    const segments = path.split('/');
    const fireId = segments[1];

    return fireId;
  }
}

