// src/app/main/main-content/message-box/channel-message/channel-message.component.ts
import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TextareaComponent } from '../textarea/textarea.component';

import { ChannelService } from '../../../../firebase-services/channel.service';
import { DataService } from '../../../../firebase-services/data.service';
import { MessageService } from '../../../../firebase-services/message.service';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EditChannelComponent } from './../../../../overlays/edit-channel/edit-channel.component';
import { AddUserToChannelComponent } from '../../../../overlays/add-user-to-channel/add-user-to-channel.component';

import { Subscription } from 'rxjs';
import { Channel } from '../../../../models/channel.class';

@Component({
  selector: 'app-channel-message',
  standalone: true,
  imports: [CommonModule, TextareaComponent, FormsModule, MatDialogModule],
  templateUrl: './channel-message.component.html',
  styleUrls: ['./channel-message.component.scss'],
})
export class ChannelMessageComponent implements OnInit, OnDestroy {
  @Input() channelId!: string;

  /* --------------------------------------------------
     Datenfelder
  -------------------------------------------------- */
  channelMessages: any[] = [];
  channelMessagesTime: { timestamp: Date }[] = [];

  currentChannel: Channel | null = null;
  currentChannelId?: string;
  selectChannel = '';
  channelDescription = '';
  channelCreatedBy = '';

  currentUser: any = null;
  allChannels: any[] = [];

  private channelMessagesSubscription!: Subscription;
  private currentUserSubscription!: Subscription;

  constructor(
    private channelService: ChannelService,
    private messageService: MessageService,
    private dataService: DataService,
    private dialog: MatDialog
  ) {}

  /* --------------------------------------------------
     Lifecycle
  -------------------------------------------------- */
  ngOnInit(): void {
    this.channelService.currentChat$.subscribe((chat: any) => {
      if (chat?.type === 'channel') {
        this.currentChannelId = chat.id;
        this.updateChannelMessages();
        this.loadChannelName(chat.id);
        this.listenToChannelDoc(chat.id);
      }
    });

    this.messageService.channels$.subscribe((chs) => (this.allChannels = chs));

    this.currentUserSubscription = this.dataService.logedUser$.subscribe(
      (u) => (this.currentUser = u)
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['channelId']?.currentValue) {
      this.updateChannelMessages();
      this.loadChannelName(this.channelId);
      this.listenToChannelDoc(this.channelId);
    }
  }

  ngOnDestroy(): void {
    this.channelMessagesSubscription?.unsubscribe();
    this.currentUserSubscription?.unsubscribe();
  }

  /* --------------------------------------------------
     Getter / Setter für Channel‑Anzeige‑Name
  -------------------------------------------------- */
  /** Wird im Template für Platzhalter verwendet */
  get displayChannelName(): string {
    return (
      this.selectChannel ||
      (this.allChannels.length > 0 ? this.allChannels[0].channelName : '')
    );
  }

  /** Schreibt den Namen ins DataService (z. B. für Sidebar‑Thread‑Header) */
  private saveDisplayChannelName(): void {
    this.dataService.setdisplayChannelName(this.displayChannelName);
  }

  /* --------------------------------------------------
     Daten‑Laden
  -------------------------------------------------- */
  private updateChannelMessages(): void {
    if (!this.currentChannelId) return;
    this.channelMessagesSubscription?.unsubscribe();
    this.channelMessagesSubscription = this.channelService
      .listenToChannelMessages(this.currentChannelId)
      .subscribe((msgs) => {
        this.channelMessages = msgs;
        this.channelMessagesTime = msgs.map((m) => ({
          timestamp: m.timestamp.toDate(),
        }));
      });
  }

  private loadChannelName(id: string): void {
    this.channelService
      .loadChannel(id)
      .then((ch) => {
        if (ch) {
          this.currentChannel = ch;
          this.selectChannel = ch.channelName;
          this.channelDescription = ch.channelDescription;
          this.channelCreatedBy = ch.channelCreatedBy;
          this.saveDisplayChannelName();
        }
      })
      .catch((err) => console.error('Error loading channel name:', err));
  }

  private listenToChannelDoc(id: string): void {
    this.channelService
      .listenToChannel(id)
      .subscribe((ch) => (this.currentChannel = ch));
  }

  /* --------------------------------------------------
     Dialog‑Interaktionen
  -------------------------------------------------- */
  openEditChannel(): void {
    this.dialog.open(EditChannelComponent, {
      panelClass: 'custom-dialog-container',
      data: {
        channelName: this.selectChannel,
        channelDescription: this.channelDescription,
        channelCreatedBy: this.channelCreatedBy,
      },
    });
  }

  openAddUserDialog(): void {
    this.dialog.open(AddUserToChannelComponent, {
      data: { channelId: this.currentChannelId },
    });
  }

  editMessage(msg: any): void {
    console.log('Edit', msg);
  }

  deleteMessage(msg: any): void {
    console.log('Delete', msg);
  }

  /* ---------- Thread‑Funktion ---------- */
  toggleThread(msg: any): void {
    this.dataService.sidebarThreadIsVisible = true;
    this.dataService.setCurrentThreadMessage(msg); // <‑‑ hier geändert
  }

  /* --------------------------------------------------
     Utils
  -------------------------------------------------- */
  shouldShowDate(ts: Date, idx: number): boolean {
    if (idx === 0) return true;
    return (
      this.dateKey(ts) !==
      this.dateKey(this.channelMessagesTime[idx - 1].timestamp)
    );
  }

  private dateKey(d: Date): string {
    return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}`;
  }
}
