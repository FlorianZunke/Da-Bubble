// src/app/main/main-content/message-box/channel-message/channel-message.component.ts
import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  SimpleChanges,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { TextareaComponent } from '../textarea/textarea.component';
import { ChannelService } from '../../../../firebase-services/channel.service';
import { DataService } from '../../../../firebase-services/data.service';
import { MessageService } from '../../../../firebase-services/message.service';
import { EditChannelComponent } from './../../../../overlays/edit-channel/edit-channel.component';
import { AddUserToChannelComponent } from '../../../../overlays/add-user-to-channel/add-user-to-channel.component';

import { Subscription } from 'rxjs';
import { Channel } from '../../../../models/channel.class';

@Component({
  selector: 'app-channel-message',
  standalone: true,
  imports: [CommonModule, TextareaComponent, FormsModule, MatDialogModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './channel-message.component.html',
  styleUrls: ['./channel-message.component.scss'],
})
export class ChannelMessageComponent implements OnInit, OnDestroy {
  @Input() channelId!: string;

  // ─── Daten ────────────────────────────────────────────
  channelMessages: any[] = [];
  channelMessagesTime: { timestamp: Date }[] = [];
  currentChannel: Channel | null = null;
  currentChannelId?: string;
  selectChannel = '';
  channelDescription = '';
  channelCreatedBy = '';
  allChannels: any[] = [];

  currentUser: any = null;

  // für Emoji-Picker
  reactionPickerMessageId: string | null = null;
  // für „Mehr“-Options-Menü
  moreOptionsForMsgId: string | null = null;

  private channelMessagesSubscription!: Subscription;
  private currentUserSubscription!: Subscription;

  constructor(
    private channelService: ChannelService,
    private messageService: MessageService,
    private dataService: DataService,
    private dialog: MatDialog
  ) {}

  // ─── Lifecycle ────────────────────────────────────────
  ngOnInit(): void {
    // Wenn Chat wechselt, Channel-Daten laden
    this.channelService.currentChat$.subscribe((chat: any) => {
      if (chat?.type === 'channel') {
        this.currentChannelId = chat.id;
        this.updateChannelMessages();
        this.loadChannelName(chat.id);
        this.listenToChannelDoc(chat.id);
      }
    });

    // Kanäle für Anzeige
    this.messageService.channels$.subscribe((chs) => (this.allChannels = chs));

    // Aktueller User
    this.currentUserSubscription = this.dataService.logedUser$.subscribe(
      (u) => (this.currentUser = u)
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['channelId']?.currentValue) {
      this.currentChannelId = this.channelId;
      this.updateChannelMessages();
      this.loadChannelName(this.channelId);
      this.listenToChannelDoc(this.channelId);
    }
  }

  ngOnDestroy(): void {
    this.channelMessagesSubscription?.unsubscribe();
    this.currentUserSubscription?.unsubscribe();
  }

  // ─── Getter für Header ─────────────────────────────────
  get displayChannelName(): string {
    return (
      this.selectChannel ||
      (this.allChannels.length > 0 ? this.allChannels[0].channelName : '')
    );
  }
  private saveDisplayChannelName(): void {
    this.dataService.setdisplayChannelName(this.displayChannelName);
  }

  // ─── Daten Laden ───────────────────────────────────────
  private updateChannelMessages(): void {
    if (!this.currentChannelId) return;
    this.channelMessagesSubscription?.unsubscribe();
    this.channelMessagesSubscription = this.channelService
      .listenToChannelMessages(this.currentChannelId)
      .subscribe((msgs) => {
        // Sicherstellen, dass reactions-Array existiert
        this.channelMessages = msgs.map((m) => ({
          ...m,
          reactions: Array.isArray(m.reactions) ? [...m.reactions] : [],
        }));
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

  // ─── Dialogs ───────────────────────────────────────────
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

  // ─── Action-Menü Funktionen ────────────────────────────
  editMessage(msg: any): void {
    console.log('Edit', msg);
    // später echte Edit-Logik einfügen
  }

  deleteMessage(msg: any): void {
    console.log('Delete', msg);
    // später channelService.deleteMessage(…) aufrufen
  }

  openMoreOptions(msg: any): void {
    this.moreOptionsForMsgId =
      this.moreOptionsForMsgId === msg.id ? null : msg.id;
  }

  // ─── Emoji-Picker ──────────────────────────────────────
  toggleReactionPicker(msg: any): void {
    this.reactionPickerMessageId =
      this.reactionPickerMessageId === msg.id ? null : msg.id;
  }

  onReactionSelected(event: any, msg: any): void {
    const emoji = event.detail.unicode || event.detail.emoji;
    if (emoji && !msg.reactions.includes(emoji)) {
      msg.reactions.push(emoji);
      // persistiere die neuen reactions:
      this.channelService
        .updateMessageReactions(
          this.currentChannelId ?? '',
          msg.id,
          msg.reactions
        )
        .catch(console.error);
    }
    this.reactionPickerMessageId = null;
  }

  // ─── Thread öffnen ─────────────────────────────────────
  toggleThread(msg: any): void {
    this.dataService.sidebarThreadIsVisible = true;
    this.dataService.setCurrentThreadMessage(msg);
  }

  // ─── Datumsgrouping ─────────────────────────────────────
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
