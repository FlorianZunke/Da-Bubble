import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
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
import { Subscription } from 'rxjs';

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

  channelMessages: any[] = [];  // Nachrichten, die angezeigt werden
  channelMessagesTime: { timestamp: string }[] = [];
  currentChannelName: string = '';
  currentChannelId: string | undefined = '';
  selectChannel: string = '';
  channelDescription: string = '';
  channelCreatedBy: string = '';
  messages: any[] = [];
  textInput: string = '';
  currentUser: any = null;
  allChannels: any[] = [];
  private loggedUser: any = null;
  private channelMessagesSubscription!: Subscription; // Subscription für den Echtzeit-Listener
  private currentUserSubscription!: Subscription; // Subscription für den aktuellen Benutzer

  // Das komplette Channel-Objekt (inkl. members)
  currentChannel: Channel | null = null;

  constructor(
    private channelService: ChannelService,
    private messageService: MessageService,
    private dataService: DataService,
    private dialog: MatDialog // NEU: MatDialog per Konstruktor anfordern
  ) { }

  ngOnInit(): void {

    // 1) Abonniere den aktuellen Chat und lade Channel-Name & Nachrichten
    this.channelService.currentChat$.subscribe((chat: any) => {
      if (chat && chat.type === 'channel') {
        this.currentChannelId = chat.id;

        this.updateChannelMessages();

        // Lade den ChannelName
        this.loadChannelName(chat.id);

        // Lade Nachrichten
        this.loadMessages(chat.id);

        // Abonniere das komplette Channel-Dokument (inkl. members)
        this.listenToChannelDoc(chat.id);
      }
    });

    // 2) Abonniere das Observable aller Kanäle
    this.messageService.channels$.subscribe((channels: any[]) => {
      this.allChannels = channels;
      if (this.allChannels && this.allChannels.length > 0) {
        console.log('Erster Kanal:', this.allChannels[0].channelName);
      }
    });


    // Abonniere den aktuell angemeldeten Benutzer
    this.currentUserSubscription = this.dataService.logedUser$.subscribe(loggedUser => {
      this.currentUser = loggedUser;
    });
  }

  savedisplayChannelName(): void {
    this.dataService.setdisplayChannelName(this.displayChannelName);
  }

  get displayChannelName(): string {
    return (
      this.selectChannel ||
      (this.allChannels.length > 0 ? this.allChannels[0].channelName : '')
    );
  }

  // Lädt nur den ChannelName via loadChannel (wie bisher)
  async loadChannelName(channelId: string): Promise<void> {
    try {
      const channel = await this.channelService.loadChannel(channelId);
      if (channel) {
        this.currentChannelName = channel.channelName;
        this.selectChannel = channel.channelName;
        this.channelDescription = channel.channelDescription;
        this.channelCreatedBy = channel.channelCreatedBy;
        this.savedisplayChannelName();
      }
    } catch (error) {
      console.error('Error loading channel name:', error);
    }
  }


  loadMessages(channelId: string): void {
    // Vorherige Subscription beenden, falls vorhanden
    if (this.channelMessagesSubscription) {
      this.channelMessagesSubscription.unsubscribe();
    }

    // Neue Subscription erstellen
    this.channelMessagesSubscription = this.channelService
      .listenToChannelMessages(channelId)
      .subscribe((channelMessages: any[]) => {
        this.channelMessages = channelMessages;
         // Mappe nur die Timestamp‑Felder heraus
         this.channelMessagesTime = channelMessages.map(msg => ({ timestamp: msg.timestamp.toDate() }));
         console.log(this.channelMessagesTime);
      });
  }

  // Abonniert das komplette Channel-Dokument (members, etc.)
  listenToChannelDoc(channelId: string): void {
    this.channelService.listenToChannel(channelId).subscribe((channelData) => {
      this.currentChannel = channelData;
      this.currentChannelId = channelData.id;
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
        channelCreatedBy: this.channelCreatedBy,
      },
    });
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['channelId'] && changes['channelId'].currentValue) {
      this.updateChannelMessages();
      this.loadChannelName(this.channelId);
      this.listenToChannelDoc(this.channelId);
    }
  }


  private updateChannelMessages(): void {
    if (!this.currentChannelId) {
      console.error("channelId ist undefined – Subscription wird nicht gestartet.");
      return;
    }
    if (this.channelMessagesSubscription) {
      this.channelMessagesSubscription.unsubscribe();
    }
    this.channelMessagesSubscription = this.channelService
      .listenToChannelMessages(this.currentChannelId)
      .subscribe(channelMessages => {
        // Neue Referenz für Change Detection
        this.channelMessages = [...channelMessages];
      });
  }


  ngOnDestroy(): void {
    if (this.channelMessagesSubscription) {
      this.channelMessagesSubscription.unsubscribe();
    }
    if (this.currentUserSubscription) {
      this.currentUserSubscription.unsubscribe();
    }
  }

  shouldShowDate(timestamp: string, index: number): boolean {
    if (index == 0) {
      return true;
    }

    const todayKey = this.toDateKey(timestamp);
    const prevKey = this.toDateKey(this.channelMessagesTime[index - 1].timestamp);
    return todayKey !== prevKey;
  }


  toDateKey(timestamp: string): string {
    const d = new Date(timestamp);
    // buildKey ohne Jahr: "TT.MM"
    return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}`;
  }
}