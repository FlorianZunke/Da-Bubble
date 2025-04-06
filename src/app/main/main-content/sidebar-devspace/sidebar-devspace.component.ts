import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from './../../../firebase-services/data.service';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ChannelOverlayComponent } from '../../../overlays/channel-overlay/channel-overlay.component';
import { ChannelService } from '../../../firebase-services/channel.service';
import { Router } from '@angular/router';
import { LogService } from '../../../firebase-services/log.service';
import { AuthService } from '../../../firebase-services/auth.service';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-sidebar-devspace',
  imports: [CommonModule, MatButtonModule, FormsModule],
  templateUrl: './sidebar-devspace.component.html',
  styleUrl: './sidebar-devspace.component.scss'
})
export class SidebarDevspaceComponent {
  dataService = inject(DataService);
  readonly dialog = inject(MatDialog);
  channelFireId: any = '';
  loadedChannel: any = {};
  channel: any = {};
  channels: any[] = [];
  directChat: any = [];
  users: any[] = [];


  constructor(private firebaseChannels: ChannelService, private router: Router, private logService: LogService) { }


  toggleChannel() {
    this.dataService.channelMenuIsHidden = !this.dataService.channelMenuIsHidden;
    const toggleChannel = document.getElementById('channel');
    if (toggleChannel) {
      toggleChannel.classList.toggle('d-none');
    }
  }

  toggleUserChannel() {
    this.dataService.directMessageMenuIsHidden = !this.dataService.directMessageMenuIsHidden;
    const toggleUserChannel = document.getElementById('user-channel');
    if (toggleUserChannel) {
      toggleUserChannel.classList.toggle('d-none');
    }
  }


  openDialog() {
    this.dialog.open(ChannelOverlayComponent, {
      panelClass: 'custom-dialog-container'
    });
  }


  ngOnInit() {
    this.firebaseChannels.channels$.subscribe(channels => {
      this.channels = channels; // Automatische Updates empfangen
    });

    this.logService.users$.subscribe(users => {
      this.users = users; // Benutzerliste aus dem Service abrufen
    });

    this.firebaseChannels.currentDirectChat$.subscribe(chat => {
      this.directChat = chat; // Automatische Updates empfangen
    });
  }


  selectChannel(channelId: string) {
    this.channelFireId = channelId;
    this.loadChannelFirstTime(channelId);
  }


  async loadChannelFirstTime(channelId: string) {
    this.channel = await this.firebaseChannels.loadChannel(this.channelFireId);
    this.firebaseChannels.setCurrentChannelChat('channel', channelId);
  }


  async selectUser(userId: string) {
    try {
      const currentUser = await firstValueFrom(this.dataService.logedUser$);
  
      if (currentUser?.fireId) {
        const chatId = await this.firebaseChannels.getOrCreateDirectChat(currentUser.fireId, userId);

        this.dataService.setChatId(chatId);
        this.firebaseChannels.setCurrentDirectMessagesChat('directMessages', chatId);
      }
    } catch (error) {
      console.error('Fehler beim Laden des aktuellen Benutzers:', error);
    }
  }

  openNewMessage() {
  }
}
