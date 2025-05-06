// src/app/main/main-content/message-box/channel-message/channel-message.component.ts
import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  SimpleChanges,
  CUSTOM_ELEMENTS_SCHEMA,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { TextareaComponent } from '../textarea/textarea.component';
import { ChannelService } from '../../../../firebase-services/channel.service';
import { DataService } from '../../../../firebase-services/data.service';
import { MessageService } from '../../../../firebase-services/message.service';
import { EditChannelComponent } from './../../../../overlays/edit-channel/edit-channel.component';
import { AddUserToChannelComponent } from '../../../../overlays/add-user-to-channel/add-user-to-channel.component';
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

  /* ─── Daten ──────────────────────────────────────────── */
  channelMessages: any[] = [];
  channelMessagesTime: { timestamp: Date }[] = [];
  currentChannel: Channel | null = null;
  currentChannelId?: string;
  selectChannel = '';
  channelDescription = '';
  channelCreatedBy = '';
  allChannels: any[] = [];
  currentUser: any = null;
  @ViewChild(TextareaComponent) textareaComponent!: TextareaComponent;

  // für Reactions (Emoji-Picker)
  reactionPickerMessageId: string | null = null;
  // für Edit-Mode
  editingMessageId: string | null = null;
  editingText = '';

  // Subscriptions verwalten
  private channelMessagesSubscription!: Subscription;
  private currentUserSubscription!: Subscription;
  private threadCountSubscriptions: Subscription[] = [];

  constructor(
    private channelService: ChannelService,
    private messageService: MessageService,
    private dataService: DataService,
    private dialog: MatDialog
  ) {}

  /* ─── Lifecycle ──────────────────────────────────────── */
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
      this.currentChannelId = this.channelId;
      this.updateChannelMessages();
      this.loadChannelName(this.channelId);
      this.listenToChannelDoc(this.channelId);
    }
  }

  ngAfterViewInit() {
    // Fokussiere das Eingabefeld beim ersten Rendern
    setTimeout(() => {
      this.textareaComponent?.focusTextarea();
    }, 0);
  }

  ngOnDestroy(): void {
    this.channelMessagesSubscription?.unsubscribe();
    this.currentUserSubscription?.unsubscribe();
    this.threadCountSubscriptions.forEach((s) => s.unsubscribe());
  }

  /* ─── Header & Kanalname ─────────────────────────────── */
  get displayChannelName(): string {
    return (
      this.selectChannel ||
      (this.allChannels.length > 0 ? this.allChannels[0].channelName : '')
    );
  }
  private saveDisplayChannelName(): void {
    this.dataService.setdisplayChannelName(this.displayChannelName);
  }

  /* ─── Nachrichten Laden ───────────────────────────────── */
  private updateChannelMessages(): void {
    if (!this.currentChannelId) return;

    // alte Subs für threadCount aufräumen
    this.threadCountSubscriptions.forEach((s) => s.unsubscribe());
    this.threadCountSubscriptions = [];

    this.channelMessagesSubscription?.unsubscribe();
    this.channelMessagesSubscription = this.channelService
      .listenToChannelMessages(this.currentChannelId)
      .subscribe((msgs) => {
        // Basis-Mapping
        this.channelMessages = msgs.map((m) => ({
          ...m,
          reactions: Array.isArray(m.reactions)
            ? [...m.reactions]
            : m.reactions
            ? [m.reactions]
            : [],
          threadCount: 0, // initial
        }));
        console.log(msgs);
        this.channelMessagesTime = msgs.map((m) => ({
          timestamp: m.timestamp?.toDate() ?? new Date(),
        }));

        // Thread-Count für jede Nachricht laden
        this.channelMessages.forEach((msg) => {
          const sub = this.channelService
            .listenToThreadReplies(this.currentChannelId!, msg.id)
            .subscribe((replies) => {
              msg.threadCount = replies.length;
            });
          this.threadCountSubscriptions.push(sub);
        });
      });
  }

  private loadChannelName(id: string): void {
    this.channelService
      .loadChannel(id)
      .then((ch) => {
        if (ch) {
          this.currentChannel = ch as Channel;
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

  /* ─── Dialogs ─────────────────────────────────────────── */
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

  /* ─── Edit-Mode ───────────────────────────────────────── */
  editMessage(msg: any): void {
    this.editingMessageId = msg.id;
    this.editingText = msg.text;
  }

  cancelEdit(): void {
    this.editingMessageId = null;
  }

  saveEdit(msg: any): void {
    if (!this.currentChannelId) return;
    this.channelService
      .editChannelMessage(
        this.currentChannelId,
        msg.id,
        this.editingText.trim()
      )
      .then(() => {
        msg.text = this.editingText.trim();
        this.editingMessageId = null;
      })
      .catch(console.error);
  }

  /* ─── Mehr-Menü für Channels ─────────────────────────── */
  openMoreOptions(msg: any): void {
    console.log('More options for', msg);
  }

  /* ─── Emoji-Picker ───────────────────────────────────── */
  toggleReactionPicker(msg: any): void {
    this.reactionPickerMessageId =
      this.reactionPickerMessageId === msg.id ? null : msg.id;
  }

  onReactionSelected(event: any, msg: any): void {
    const emoji = event.detail.unicode || event.detail.emoji;
    if (!emoji) return;
    if (msg.reactions.length >= 5) return;
    if (!msg.reactions.includes(emoji)) {
      msg.reactions.push(emoji);
      this.channelService.updateMessageReactions(
        this.currentChannel?.id || '',
        msg.id,
        msg.reactions // <-- vollständiges Array übergeben
      );
    }
    this.reactionPickerMessageId = null;
  }

  removeReaction(msg: any, reaction: string): void {
    const idx = msg.reactions.indexOf(reaction);
    if (idx > -1) msg.reactions.splice(idx, 1);
    // TODO: Persist via channelService.updateMessageReactions(...)
  }

  /* ─── Thread öffnen ───────────────────────────────────── */
  toggleThread(msg: any): void {
    this.dataService.sidebarThreadIsVisible = true;
    this.dataService.setCurrentThreadMessage({
      ...msg,
      channelId: this.currentChannelId,
    });

    console.log('Thread geöffnet:', msg);
  }

  /* ─── Datumsköpfe ────────────────────────────────────── */
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
