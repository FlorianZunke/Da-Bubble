import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ChannelOverlayComponent } from '../../../overlays/channel-overlay/channel-overlay.component';
import { ChannelService } from '../../../firebase-services/channel.service';


@Component({
  selector: 'app-sidebar-devspace',
  imports: [CommonModule, MatButtonModule,],
  templateUrl: './sidebar-devspace.component.html',
  styleUrl: './sidebar-devspace.component.scss'
})
export class SidebarDevspaceComponent {

  readonly dialog = inject(MatDialog);
  channelFireId: any = '';
  loadedChannel: any = {};
  channel: any = {};
  channels: any[] = [];

  constructor(private firebaseChannels: ChannelService) { }


  openDialog() {
    this.dialog.open(ChannelOverlayComponent);
  }


  ngOnInit() {
    this.firebaseChannels.channels$.subscribe(channels => {
      this.channels = channels; // 🔥 Automatische Updates empfangen
    });
  }


  selectChannel(channelId: string) {
    this.channelFireId = channelId;
    this.loadChannelFirstTime();
  }


  async loadChannelFirstTime() {
    this.channel = await this.firebaseChannels.loadChannel(this.channelFireId);
  }
}
