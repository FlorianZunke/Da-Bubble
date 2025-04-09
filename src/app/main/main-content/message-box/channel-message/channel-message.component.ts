import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextareaComponent } from '../textarea/textarea.component';
import { ChannelService } from '../../../../firebase-services/channel.service';
import { DataService } from '../../../../firebase-services/data.service';
import { LogService } from '../../../../firebase-services/log.service';
import { Firestore, onSnapshot } from 'firebase/firestore';
import { FormsModule } from '@angular/forms';
import { EditChannelComponent } from './../../../../overlays/edit-channel/edit-channel.component';
import { MessageService } from '../../../../firebase-services/message.service';
import { Channel } from '../../../../models/channel.class';
// NEU: MatDialog-Import
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
// Pfad ggf. anpassen, falls dein Overlay woanders liegt
import { AddUserToChannelComponent } from '../../../../overlays/add-user-to-channel/add-user-to-channel.component';


@Component({
  selector: 'app-channel-message',
  standalone: true,
  imports: [
    CommonModule,
    TextareaComponent,
    FormsModule,
    MatDialogModule, // Dialogmodule importieren
  ],
  templateUrl: './channel-message.component.html',
  styleUrls: ['./channel-message.component.scss'],
})

export class ChannelMessageComponent implements OnInit {
  @Input() channelId!: string;
  @Input() chatId!: string;

  currentChannelName: string = '';
  currentChannelId: string = '';
  selectChannel: string = '';
  channelDescription: string = '';
  channelCreatedBy: string = '';
  messages: any[] = [];
  textInput: string = '';
  currentUser: any = null;
  allChannels: any[] = [];
  private loggedUser: any = null;
  readonly dialog = inject(MatDialog);

  // Das komplette Channel-Objekt (inkl. members)
  currentChannel: Channel | null = null;

  constructor(
    private channelService: ChannelService,
    private messageService: MessageService,
    private dataService: DataService
    ) {
}
  
    private dialog: MatDialog // NEU: MatDialog per Konstruktor anfordern
  ) {
    // Abonniere currentChannel$ (um Kanalname & ID zu erhalten)
      this.messageService.currentChannel$.subscribe((channel: any) => {
      this.currentChannelName = channel?.name || '';
      this.currentChannelId = channel?.id || '';
    });
  }

  ngOnInit(): void {
    // 1) Abonniere das Observable aller Kanäle
    this.messageService.channels$.subscribe((channels: any[]) => {
      this.allChannels = channels;
      if (this.allChannels && this.allChannels.length > 0) {
        console.log('Erster Kanal:', this.allChannels[0].channelName);
      }
    });

    // 2) Abonniere den aktuellen Chat und lade Channel-Name & Nachrichten
    this.channelService.currentChat$.subscribe((chat: any) => {
      if (chat && chat.type === 'channel') {
        this.currentChannelId = chat.id;

        // Lade den ChannelName
        this.loadChannelName(chat.id);

        // Lade Nachrichten
        this.loadMessages(chat.id);

        // Abonniere das komplette Channel-Dokument (inkl. members)
        this.listenToChannelDoc(chat.id);
      }
    });
  }

  savedisplayChannelName(): void {
    this.dataService.setdisplayChannelName(this.displayChannelName);
  }

  get displayChannelName(): string {
      return this.selectChannel || (this.allChannels.length > 0 ? this.allChannels[0].channelName : '');
  }

  async loadChannelName(channelId: string) {
    const channel = await this.channelService.loadChannel(channelId);

    if (channel) {
      this.selectChannel = channel.channelName;
      this.channelDescription = channel.channelDescription;
      this.channelCreatedBy = channel.channelCreatedBy;
      this.savedisplayChannelName();
      }
  }

  // Lädt nur den ChannelName via loadChannel (wie bisher)
  //async loadChannelName(channelId: string): Promise<void> {
  //  try {
  //    const channel = await this.channelService.loadChannel(channelId);
  //    if (channel) {
  //      this.currentChannelName = channel.channelName;
        
  //    }
  //  } catch (error) {
  //    console.error('Error loading channel name:', error);
  //  }
  //}

  // Lädt die Nachrichten (wie bisher)
  loadMessages(channelId: string): void {
    console.log('Loading messages for channel:', channelId);
    this.channelService
      .listenToChannelMessages(channelId)
      .subscribe((messages: any) => {
        this.messages = messages;
        console.log('Messages:', this.messages);
      });
  }

  // Abonniert das komplette Channel-Dokument (members, etc.)
  listenToChannelDoc(channelId: string): void {
    this.channelService.listenToChannel(channelId).subscribe((channelData) => {
      this.currentChannel = channelData;
      console.log('Aktueller Channel-Datensatz:', this.currentChannel);
    });
  }

  // NEU: Dialog öffnen, um User zum Channel hinzuzufügen
  openAddUserDialog(): void {
    // channelId => this.currentChannelId
    this.dialog.open(AddUserToChannelComponent, {
      data: { channelId: this.currentChannelId },
      // Optional: width, height, etc.
    });
  }

  // Falls du im Template irgendetwas wie (someOutput)="sendSomething($event)" nutzen willst
  sendSomething(value: any) {
    console.log('sendSomething triggered mit:', value);
    // Hier kannst du Nachrichten verschicken o.Ä.
  }

  openEditChannel() {
    this.dialog.open(EditChannelComponent, {
        panelClass: 'custom-dialog-container',
        
        data: { 
            channelName: this.displayChannelName,
            channelDescription: this.channelDescription,
            channelCreatedBy: this.channelCreatedBy
        }
    });
  }
}