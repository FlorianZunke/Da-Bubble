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
import { ChannelService } from '../../../../firebase-services/channel.service';
import { DataService } from '../../../../firebase-services/data.service';
import { TextareaComponent } from '../textarea/textarea.component';

@Component({
  selector: 'app-direct-message',
  standalone: true,
  imports: [CommonModule, TextareaComponent, FormsModule],
  templateUrl: './direct-message.component.html',
  styleUrls: ['./direct-message.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DirectMessageComponent implements OnInit, OnDestroy {
  directMessages: any[] = [];
  directMessagesTime: { timestamp: Date }[] = [];
  currentUser: any = null;
  selectedUser: any = null;
  chatId: string | null = null;
  textInput = '';

  // Für Reactions
  reactionPickerMessageId: string | null = null;
  // Für Edit
  editingMessageId: string | null = null;
  editingText = '';

  private userSub!: Subscription;
  private partnerSub!: Subscription;
  private chatIdSub!: Subscription;
  private directSub!: Subscription;

  constructor(
    private channelService: ChannelService,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    // eingeloggter User
    this.userSub = this.dataService.logedUser$.subscribe(
      (u) => (this.currentUser = u)
    );

    // gewählter Chat-Partner
    this.partnerSub = this.channelService.selectedChatPartner$.subscribe(
      (user) => (this.selectedUser = user)
    );

    // aktueller Chat-ID
    this.chatIdSub = this.dataService.currentChatId$.subscribe((id) => {
      this.chatId = id;
      // altes Abo schließen
      this.directSub?.unsubscribe();
      if (id) {
        this.directSub = this.channelService
          .listenToDirectMessages(id)
          .subscribe((msgs) => {
            this.directMessages = msgs.map((m) => ({
              ...m,
              reactions: Array.isArray(m.reactions) ? [...m.reactions] : [],
            }));
            this.directMessagesTime = msgs.map((m) => ({
              // falls m.timestamp null ist, verwende jetzt()
              timestamp: m.timestamp?.toDate() ?? new Date(),
            }));
          });
      }
    });
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
    this.partnerSub.unsubscribe();
    this.chatIdSub.unsubscribe();
    this.directSub.unsubscribe();
  }

  onSendClick(): void {
    const txt = this.textInput.trim();
    if (!txt || !this.currentUser || !this.chatId) return;

    this.channelService.sendDirectMessage(
      this.chatId,
      this.currentUser.id, // nur die ID
      txt
    );
    this.textInput = '';
  }

  /** Datumkopfen nur einmal pro Tag */
  shouldShowDate(ts: Date, idx: number): boolean {
    if (idx === 0) return true;
    return (
      this.dateKey(ts) !==
      this.dateKey(this.directMessagesTime[idx - 1].timestamp)
    );
  }
  private dateKey(d: Date): string {
    return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}`;
  }

  /** Reaktions-Picker */
  toggleReactionPicker(msg: any): void {
    this.reactionPickerMessageId =
      this.reactionPickerMessageId === msg.id ? null : msg.id;
  }
  // src/app/main/main-content/message-box/direct-message/direct-message.component.ts
  // ...
  onReactionSelected(event: any, msg: any): void {
    const emoji = event.detail.unicode || event.detail.emoji;
    if (!emoji) return;
    // Maximal 5 Emojis pro Nachricht
    if (msg.reactions.length >= 5) {
      // Optional: kurzes Feedback an den User, z.B. Toast o.Ä.
      return;
    }
    if (!msg.reactions.includes(emoji)) {
      msg.reactions.push(emoji);
      // TODO: Backend-Update
    }
    this.reactionPickerMessageId = null;
  }

  /** Edit */
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
    // TODO: Backend-Update
  }

  /** Löschen */
  deleteMessage(msg: any): void {
    console.log('Delete', msg);
    // TODO: Backend-Delete
  }

  /** Thread öffnen */
  toggleThread(msg: any): void {
    this.dataService.sidebarThreadIsVisible = true;

    this.dataService.setCurrentThreadMessage({
      ...msg,
      chatId: this.chatId, //  ←  WICHTIG!
    });
  }

  /** Mehr-Menü */
  openMoreOptions(msg: any): void {
    console.log('More options for', msg);
    // TODO: echte Optionen implementieren
  }

  removeReaction(msg: any, emoji: string): void {
    // aus dem lokalen Array entfernen
    msg.reactions = msg.reactions.filter((e: string) => e !== emoji);
    // und im Backend updaten
    if (this.chatId) {
      this.channelService
        .updateDirectMessageReactions(this.chatId, msg.id, msg.reactions)
        .catch(console.error);
    }
  }
}
