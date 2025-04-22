// src/app/main/main-content/message-box/direct-message/direct-message.component.ts
import {
  Component,
  OnInit,
  OnDestroy,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { TextareaComponent } from '../textarea/textarea.component';
import { ChannelService } from '../../../../firebase-services/channel.service';
import { DataService } from '../../../../firebase-services/data.service';

@Component({
  selector: 'app-direct-message',
  standalone: true,
  imports: [CommonModule, TextareaComponent, FormsModule],
  templateUrl: './direct-message.component.html',
  styleUrls: ['./direct-message.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DirectMessageComponent implements OnInit, OnDestroy {
  /* ----------------------------- State ----------------------------- */
  directMessages: any[] = [];
  directMessagesTime: { timestamp: string }[] = [];

  currentUser: any = null;
  selectedUser: any = null;
  chatId: string | null = null;

  textInput = '';

  /* Reactions */
  reactionPickerMessageId: string | null = null;

  /* Edit */
  editingMessageId: string | null = null;
  editingText = '';

  /* Subs */
  private directSub?: Subscription;
  private userSub?: Subscription;

  /* ------------------------- Constructor -------------------------- */
  constructor(
    private channelService: ChannelService,
    private dataService: DataService
  ) {}

  /* ------------------------- Lifecycle --------------------------- */
  ngOnInit(): void {
    /* Aktueller User */
    this.userSub = this.dataService.logedUser$.subscribe(
      (u) => (this.currentUser = u)
    );

    /* Gesprächspartner */
    this.channelService.selectedChatPartner$.subscribe(
      (user) => (this.selectedUser = user)
    );

    /* Chat‑ID wechseln */
    this.dataService.currentChatId$.subscribe((id) => {
      this.chatId = id;
      this.directSub?.unsubscribe();

      /* --------- Guard: nur wenn eine ID vorhanden ist --------- */
      if (!id) {
        this.directMessages = [];
        this.directMessagesTime = [];
        return;
      }

      /* --------- Listener starten --------- */
      this.directSub = this.channelService
        .listenToDirectMessages(id) // id ist hier garantiert string
        .subscribe((msgs) => {
          this.directMessages = msgs.map((m) => ({
            ...m,
            reactions: Array.isArray(m.reactions) ? [...m.reactions] : [],
          }));
          this.directMessagesTime = msgs.map((m) => ({
            timestamp: m.timestamp.toDate(),
          }));
        });
    });
  }

  ngOnDestroy(): void {
    this.directSub?.unsubscribe();
    this.userSub?.unsubscribe();
  }

  /* --------------------- Datum / Grouping ------------------------ */
  shouldShowDate(ts: string, idx: number): boolean {
    if (idx === 0) return true;
    return (
      this.dateKey(ts) !==
      this.dateKey(this.directMessagesTime[idx - 1].timestamp)
    );
  }
  private dateKey(ts: string): string {
    const d = new Date(ts);
    return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}`;
  }

  /* ------------------------- Reactions --------------------------- */
  toggleReactionPicker(msg: any): void {
    this.reactionPickerMessageId =
      this.reactionPickerMessageId === msg.id ? null : msg.id;
  }

  onReactionSelected(event: any, msg: any): void {
    const emoji = event.detail.unicode || event.detail.emoji;
    if (emoji && !msg.reactions.includes(emoji)) {
      msg.reactions.push(emoji);
      // TODO: Backend‑Update
    }
    this.reactionPickerMessageId = null;
  }

  /* ---------------------------- Edit ----------------------------- */
  editMessage(msg: any): void {
    this.editingMessageId = msg.id;
    this.editingText = msg.text;
  }

  cancelEdit(): void {
    this.editingMessageId = null;
  }

  saveEdit(msg: any): void {
    msg.text = this.editingText;
    this.editingMessageId = null;
    // TODO: Backend‑Update
  }

  /* --------------------------- Delete ---------------------------- */
  deleteMessage(msg: any): void {
    console.log('Delete', msg);
    // TODO: Backend‑Delete
  }

  /* ------------------------- Thread Öffnen ----------------------- */
  toggleThread(msg: any): void {
    this.dataService.sidebarThreadIsVisible = true;
    this.dataService.setCurrentThreadMessage(msg);
  }
}
