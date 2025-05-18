// src/app/main/main-content/message-box/channel-message/channel-message.component.ts

import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  OnChanges,
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
import { ToggleService } from '../../../../firebase-services/toogle.service';
import { EditChannelComponent } from './../../../../overlays/edit-channel/edit-channel.component';
import { AddUserToChannelComponent } from '../../../../overlays/add-user-to-channel/add-user-to-channel.component';
import { Channel } from '../../../../models/channel.class';
import { User } from '../../../../models/user.class';

@Component({
  selector: 'app-channel-message',
  standalone: true,
  imports: [CommonModule, TextareaComponent, FormsModule, MatDialogModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './channel-message.component.html',
  styleUrls: ['./channel-message.component.scss'],
})
export class ChannelMessageComponent implements OnInit, OnDestroy, OnChanges {
  @Input() channelId!: string;

  channelMessages: any[] = [];
  channelMessagesTime: { timestamp: Date }[] = [];
  currentChannel: Channel | null = null;
  currentUser: any = null;

  usersMap: Record<string, User> = {};

  @ViewChild(TextareaComponent) textareaComponent!: TextareaComponent;

  reactionPickerMessageId: string | null = null;
  editingMessageId: string | null = null;
  editingText = '';

  private channelMessagesSubscription!: Subscription;
  private currentUserSubscription!: Subscription;
  private profileSubscription!: Subscription;
  private threadCountSubscriptions: Subscription[] = [];

  constructor(
    private channelService: ChannelService,
    private messageService: MessageService,
    private dataService: DataService,
    private dialog: MatDialog,
    public toggleService: ToggleService
  ) {}

  /** damit {{ displayChannelName }} wieder funktioniert */
  get displayChannelName(): string {
    return this.dataService.displayChannelName;
  }

  ngOnInit(): void {
    this.messageService.getAllUsers().then((users: User[]) => {
      const map: Record<string, User> = {};
      users.forEach((u) => (map[u.id] = u));
      this.usersMap = map;
    });

    this.profileSubscription = this.dataService.loggedUser$.subscribe((u) => {
      if (u && this.usersMap[u.id]) {
        this.usersMap[u.id] = u;
      }
    });

    this.channelService.currentChat$.subscribe((chat: any) => {
      if (chat?.type === 'channel') {
        this.channelId = chat.id;
        this.updateChannelMessages();
        this.loadChannelName(chat.id);
        this.listenToChannelDoc(chat.id);
      }
    });

    this.currentUserSubscription = this.dataService.loggedUser$.subscribe(
      (u) => (this.currentUser = u)
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['channelId']?.currentValue) {
      this.channelId = changes['channelId'].currentValue;
      this.updateChannelMessages();
      this.loadChannelName(this.channelId);
      this.listenToChannelDoc(this.channelId);
    }
  }

  ngAfterViewInit() {
    setTimeout(() => this.textareaComponent?.focusTextarea(), 0);
  }

  ngOnDestroy(): void {
    this.channelMessagesSubscription?.unsubscribe();
    this.currentUserSubscription?.unsubscribe();
    this.profileSubscription?.unsubscribe();
    this.threadCountSubscriptions.forEach((s) => s.unsubscribe());
  }

  private updateChannelMessages(): void {
    if (!this.channelId) return;

    this.threadCountSubscriptions.forEach((s) => s.unsubscribe());
    this.threadCountSubscriptions = [];

    this.channelMessagesSubscription?.unsubscribe();
    this.channelMessagesSubscription = this.channelService
      .listenToChannelMessages(this.channelId)
      .subscribe((msgs) => {
        this.channelMessages = msgs.map((m) => ({
          ...m,
          senderId: m.sender.id,
          reactions: Array.isArray(m.reactions)
            ? [...m.reactions]
            : m.reactions
            ? [m.reactions]
            : [],
          threadCount: 0,
        }));
        this.channelMessagesTime = msgs.map((m) => ({
          timestamp: m.timestamp?.toDate() ?? new Date(),
        }));

        this.channelMessages.forEach((msg) => {
          const sub = this.channelService
            .listenToThreadReplies(this.channelId!, msg.id)
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
      .then((ch) => (this.currentChannel = ch as Channel))
      .catch((err) => console.error(err));
  }

  private listenToChannelDoc(id: string): void {
    this.channelService
      .listenToChannel(id)
      .subscribe((ch) => (this.currentChannel = ch));
  }

  openEditChannel(): void {
    this.dialog.open(EditChannelComponent, {
      panelClass: 'custom-dialog-container',
      data: {
        channelName: this.currentChannel?.channelName,
        channelDescription: this.currentChannel?.channelDescription,
        channelCreatedBy: this.currentChannel?.channelCreatedBy,
      },
    });
  }

  openAddUserDialog(): void {
    this.dialog.open(AddUserToChannelComponent, {
      data: { channelId: this.channelId },
    });
  }

  editMessage(msg: any): void {
    this.editingMessageId = msg.id;
    this.editingText = msg.text;
  }

  cancelEdit(): void {
    this.editingMessageId = null;
  }

  saveEdit(msg: any): void {
    if (!this.channelId) return;
    this.channelService
      .editChannelMessage(this.channelId, msg.id, this.editingText.trim())
      .then(() => {
        msg.text = this.editingText.trim();
        this.editingMessageId = null;
      })
      .catch(console.error);
  }

  toggleReactionPicker(msg: any): void {
    this.reactionPickerMessageId =
      this.reactionPickerMessageId === msg.id ? null : msg.id;
  }

  onReactionSelected(event: any, msg: any): void {
    const emoji = event.detail.unicode || event.detail.emoji;
    if (!emoji) return;
    if (!msg.reactions.includes(emoji) && msg.reactions.length < 5) {
      msg.reactions.push(emoji);
      this.channelService.updateMessageReactions(
        this.channelId,
        msg.id,
        msg.reactions
      );
    }
    this.reactionPickerMessageId = null;
  }

  removeReaction(msg: any, reaction: string): void {
    const idx = msg.reactions.indexOf(reaction);
    if (idx > -1) {
      msg.reactions.splice(idx, 1);
      this.channelService.updateMessageReactions(
        this.channelId,
        msg.id,
        msg.reactions
      );
    }
  }

  toggleThread(msg: any): void {
    this.dataService.sidebarThreadIsVisible = true;
    this.dataService.setCurrentThreadMessage({
      ...msg,
      channelId: this.channelId,
    });
  }

  shouldShowDate(ts: Date, idx: number): boolean {
    if (idx === 0) return true;
    return (
      this.dateKey(ts) !==
      this.dateKey(this.channelMessagesTime[idx - 1].timestamp)
    );
  }

  private dateKey(d: Date): string {
    return `${d.getDate().toString().padStart(2, '0')}.${(
      d.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}`;
  }
}
