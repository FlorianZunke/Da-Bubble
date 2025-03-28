import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from './../../../firebase-services/data.service';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ChannelOverlayComponent } from '../../../overlays/channel-overlay/channel-overlay.component';
import { ChannelService } from '../../../firebase-services/channel.service';

@Component({
  selector: 'app-sidebar-devspace',
  imports: [CommonModule, MatButtonModule],
  templateUrl: './sidebar-devspace.component.html',
  styleUrl: './sidebar-devspace.component.scss'
})
export class SidebarDevspaceComponent {
  dataService = inject(DataService);
  readonly dialog = inject(MatDialog);
  channelFireId: any = '';
  loadedChannel: any = {};
  // channel: any = {}; von Florian Firebase
  channels: any[] = [];
  activeIndex: number = -1;

  constructor(private firebaseChannels: ChannelService) { }

  channel:string[] = ['Entwicklerteam','Office-Team'];

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

  openNewMessage() {
    this.dataService.newMessageBoxIsVisible = true;
    this.dataService.directMessageBoxIsVisible = false;
    this.dataService.channelMessageBoxIsVisible = false;
  }

  openDirectMessage(i:number) {
    this.dataService.directMessageBoxIsVisible = true;
    this.dataService.newMessageBoxIsVisible = false;
    this.dataService.channelMessageBoxIsVisible = false;
    this.dataService.idUser = i; 
  }

  openChannelMessage() {
    this.dataService.channelMessageBoxIsVisible = true;
    this.dataService.newMessageBoxIsVisible = false;
    this.dataService.directMessageBoxIsVisible = false;
  }

  setUserActive(i:number) {
    this.activeIndex = i;
  }

  openDialog() {
    this.dialog.open(ChannelOverlayComponent);
  }


  // ngOnInit() {
  //   this.firebaseChannels.channels$.subscribe(channels => {
  //     this.channels = channels; // 🔥 Automatische Updates empfangen
  //   });
  // }


  // selectChannel(channelId: string) {
  //   this.channelFireId = channelId;
  //   this.loadChannelFirstTime();
  // }


  // async loadChannelFirstTime() {
  //   this.channel = await this.firebaseChannels.loadChannel(this.channelFireId);
  // }
}
