import { Component, inject, ViewChild, ElementRef } from '@angular/core';
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
import { SearchToMessageService } from '../../../firebase-services/search-to-message.service';
import { SearchService } from '../../../firebase-services/search.service';
import { MessageService } from '../../../firebase-services/message.service';
import { ToggleService } from '../../../firebase-services/toogle.service';
import { filter } from 'rxjs/operators';

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
  loggedUserFireId: string = '';

  directChat: any = [];
  users: any[] = [];
  activeChannelIndex: number = 0;
  selectedUserIndex: number = -1;

  allUsers: any[] = [];
  allChannels: any[] = [];
  loggedUserChannels: any[] = [];
  allMessages: any[] = [];

  @ViewChild('searchContainer') searchContainer!: ElementRef;
  @ViewChild('searchInputMobile') searchInputMobile!: ElementRef;

  searchResults: any[] = [];
  searchResultsUser: any[] = [];
  searchResultsChannels: any[] = [];
  searchResultsEmail: any[] = [];
  searchActiv = false;

  channelsRendered = false;

  constructor(
    public firebaseChannels: ChannelService,
    private router: Router,
    private logService: LogService,
    public dataService: DataService,
    private searchToMessageService: SearchToMessageService,
    private searchService: SearchService,
    private messageService: MessageService,
    public toggleService: ToggleService
  ) {
    this.loadMessages();
  }

  ngOnInit() {
    // (window as any).sidebarDevspaceComponent = this;

    this.firebaseChannels.activeChannelIndex$.subscribe((activeChannel) => {
      this.activeChannelIndex = activeChannel;
    });

    this.firebaseChannels.channels$
      .pipe(filter((channels) => channels.length > 0))
      .subscribe((channels) => {
        this.channels = channels;
        this.channelWithLoggedUser();
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
      for (let singleChannel of this.channels) {
        if (singleChannel.id === channelId) {
          this.activeChannelIndex = this.channels.indexOf(singleChannel);
          break;
        }
      }
    });

    this.messageService.users$.subscribe((users) => {
      this.allUsers = users;
    });

    this.messageService.channels$.subscribe((channels) => {
      this.allChannels = channels;
    });

    setTimeout(() => {
      if (this.allChannels.length !== 0) {
        this.filterChannelsForLoggedUser();
      } else {
        setTimeout(() => {
          this.filterChannelsForLoggedUser();
        }, 5000);
      }
    }, 3000);
  }

  filterChannelsForLoggedUser() {
    // console.log(this.firebaseChannels.loggedUser.fireId);
    this.allChannels.forEach((channel) =>
      channel.members.forEach((member: any) => {
        if (member.fireId === this.firebaseChannels.loggedUser.fireId) {
          this.loggedUserChannels.push(channel);
        }
      })
    );
  }

  async loadMessages() {
    this.allMessages = await this.messageService.getAllMessages();
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

  handleOutsideClick(event: MouseEvent) {
    const clickedInside = this.searchContainer.nativeElement.contains(
      event.target
    );
    if (!clickedInside) {
      this.searchActiv = false;
      this.searchInputMobile.nativeElement.value = '';
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

  showChannelMobile() {
    if (this.toggleService.isMobile) {
      this.toggleService.isMobileChannel = true;
      this.toggleService.showChannels();
    }
  }

  async selectChannelResult(item: any, inputElement: HTMLInputElement) {
    console.log('selectChannel', item);
    const id = this.getFireIdChannel(item);
    this.searchToMessageService.setChannelId(id);
    const channelIndex = this.findIndexOfChannel(id);
    this.setChannelActive(channelIndex);
    this.showChannelMobile();
    setTimeout(() => {
      const element = document.getElementById(channelIndex.toString());
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 500);
    this.clearSearch();
    inputElement.value = '';
  }

  async selectUser(userId: string) {
    try {
      const currentUser = await firstValueFrom(this.dataService.loggedUser$);
      const selectedUser = this.users.find((u) => u.id == userId);

      if (!currentUser || !selectedUser) {
        console.warn('❌ currentUser oder selectedUser ist null!');
        return;
      }

      this.firebaseChannels.setSelectedChatPartner(selectedUser);

      const chatId = await this.firebaseChannels.getOrCreateDirectChat(
        currentUser.fireId,
        selectedUser.fireId
      );
      this.dataService.setChatId(chatId);
      this.firebaseChannels.setCurrentDirectMessagesChat(chatId);

      this.dataService.newMessageBoxIsVisible = false;
      this.dataService.directMessageBoxIsVisible = true;
      this.dataService.channelMessageBoxIsVisible = false;
      const userIndex = this.findIndexOfUser(userId);
      this.setSelectedUser(userIndex);
      setTimeout(() => {
        const element = document.getElementById(`u` + userIndex.toString());
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    } catch (error) {
      console.error('Fehler beim Laden des aktuellen Benutzers:', error);
    }
  }

  findIndexOfUser(userId: string) {
    const index = this.users.findIndex((user) => user.id == userId);
    if (index === -1) {
      console.warn('❌ Benutzer nicht gefunden!');
      return -1;
    }
    return index;
  }

  setChannelActive(i: number) {
    this.firebaseChannels.setCurrentActiveChannel(i);
  }

  setSelectedUser(i: number) {
    this.selectedUserIndex = i;
  }

  showSelectUserMobile() {
    this.toggleService.isMobilSelectUser = true;
    this.toggleService.showDirect();
  }

  openNewMessage() {
    if (!this.toggleService.isMobile) {
      this.dataService.newMessageBoxIsVisible = true;
      this.dataService.directMessageBoxIsVisible = false;
      this.dataService.channelMessageBoxIsVisible = false;
    }
  }

  openNewMessageMobile() {
    if (this.toggleService.isMobile) {
      this.toggleService.isMobileNewMessage = true;
      this.toggleService.showNewMessage();
    }
  }

  onSearch(event: any) {
    const term = event.target.value;
    const results = this.searchService.performFullSearch(
      term,
      this.allUsers,
      this.loggedUserChannels,
      this.allMessages
    );

    this.searchResultsUser = results.users;
    this.searchResultsChannels = results.channels;
    this.searchResultsEmail = results.emails;
    this.searchResults = results.messages;
    // console.log(this.searchResults);
  }

  async selectedChannel(item: any, inputElement: HTMLInputElement) {
    this.searchToMessageService.setChannelId(item.id);
    const channelIndex = this.findIndexOfChannel(item.id);
    this.setChannelActive(channelIndex);
    this.toggleService.showChannels();
    // setTimeout(() => {
    //   const element = document.getElementById(channelIndex.toString());
    //   if (element) {
    //     element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    //   }
    // }, 500);
    this.searchResultsChannels = [];
    inputElement.value = '';
  }

  async selectedUser(item: any, inputElement: HTMLInputElement) {
    this.searchToMessageService.setUserId(item.id);
    this.clearSearch();
    inputElement.value = '';
  }

  clearSearch() {
    this.searchResults = [];
    this.searchResultsUser = [];
    this.searchResultsChannels = [];
    this.searchResultsEmail = [];
  }

  async selectResult(result: any, inputElement: HTMLInputElement) {
    // console.log(result);
    if (result.path.startsWith('directMessages')) {
      const chatId = await this.getFireIdPrivatChat(result);
      const chat = await this.messageService.getChatParticipants(chatId);

      if (chat) {
        const fireIdParticipantOne = chat['participants'][0];
        const fireIdParticipantTwo = chat['participants'][1];
        const loggedUser = await this.dataService.getLoggedUser();
        if (loggedUser) {
          const fireIdLoggedUser = loggedUser['fireId'];
          if (fireIdParticipantTwo !== fireIdLoggedUser) {
            const selectedUser = await this.messageService.loadSingleUserData(
              fireIdParticipantTwo
            );
            if (selectedUser) {
              this.selectDirectMessagePartner(selectedUser, chatId);
            }
          } else {
            const selectedUser = await this.messageService.loadSingleUserData(
              fireIdParticipantOne
            );
            if (selectedUser) {
              this.selectDirectMessagePartner(selectedUser, chatId);
            }
          }
        }
      }

      inputElement.value = '';
      this.clearSearch();
    } else if (result.path.startsWith('channels')) {
      this.selectChannelResult(result, inputElement);
      this.clearSearch();
    }
  }

  selectDirectMessagePartner(selectedUser: any, chatId: string) {
    this.firebaseChannels.setSelectedChatPartner(selectedUser);
    this.dataService.setChatId(chatId);
    this.firebaseChannels.setCurrentDirectMessagesChat(chatId);
    this.dataService.newMessageBoxIsVisible = false;
    this.dataService.directMessageBoxIsVisible = true;
    this.dataService.channelMessageBoxIsVisible = false;

    this.searchToMessageService.setUserId(selectedUser['id']);
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

  findIndexOfChannel(channelFireId: string) {
    const index = this.firebaseChannels.loggedUserChannels.findIndex(
      (channel) => channel.id === channelFireId
    );
    if (index === -1) {
      console.warn('❌ Channel nicht gefunden!');
      return -1;
    }

    return index;
  }

  seperateFireIdFromString(result: any) {
    const path = result.path;
    const segments = path.split('/');
    const fireId = segments[1];

    return fireId;
  }

  channelWithLoggedUser() {
    if (!this.channelsRendered) {
      this.getLoggedUser();
      this.clearloggedUserChannels();
      setTimeout(() => {
        this.filterChannelWithLoggedUser();
      }, 1000);

      // console.log(
      //   'nach durchlauf channelWithLoggedUser',
      //   this.firebaseChannels.loggedUserChannels
      // );
    }
  }

  getLoggedUser() {
    this.dataService.loggedUser$.subscribe((loggedUser) => {
      if (loggedUser) {
        this.loggedUserFireId = loggedUser.fireId;
      }
    });
  }

  clearloggedUserChannels() {
    this.firebaseChannels.loggedUserChannels = [];
  }

  filterChannelWithLoggedUser() {
    this.clearloggedUserChannels();
    for (let i = 0; i < this.channels.length; i++) {
      for (let j = 0; j < this.channels[i]['members'].length; j++) {
        if (
          this.channels[i]['members'][j]['fireId'] === this.loggedUserFireId
        ) {
          this.firebaseChannels.loggedUserChannels.push(this.channels[i]);
        }
      }
    }
  }
}
