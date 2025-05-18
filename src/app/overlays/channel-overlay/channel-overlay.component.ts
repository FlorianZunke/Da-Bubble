import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Channel } from '../../models/channel.class';
import { ChannelService } from '../../firebase-services/channel.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { AddAllUsersComponent } from './add-all-users/add-all-users.component';

@Component({
  selector: 'app-channel-overlay',
  imports: [CommonModule, MatDialogModule, MatButtonModule, FormsModule],
  templateUrl: './channel-overlay.component.html',
  styleUrl: './channel-overlay.component.scss'
})
export class ChannelOverlayComponent {
  @Input() channelId!: string;
  channels: any[] = [];
  channel: Channel = new Channel;
  channelExists: boolean = false;
  currentChannelId?: string;

  constructor(
    private dialog: MatDialog,
    private channelService: ChannelService,
  ) { }

  ngOnInit() {
    this.channelService.channels$.subscribe((channels) => {
      this.channels = channels;
    });
  }

  checkChannelExists(): void {
    this.channelExists = false;

    for (let i = 0; i < this.channels.length; i++) {
      if(this.channel.channelName === this.channels[i]['channelName']) {
        this.channelExists = true;
      }
    }
  }

  openAddAllUsers(): void {
    this.dialog.open(AddAllUsersComponent, {
      panelClass: 'add-user-container',
      data: { channel: this.channel }
    });
  }
}
