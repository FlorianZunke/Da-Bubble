// src/app/main/main-content/message-box/direct-message/direct-message.component.ts
import {
  Component,
  OnInit,
  OnDestroy,
  NgZone,
  CUSTOM_ELEMENTS_SCHEMA,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom, Subscription } from 'rxjs';
import { Firestore, collection, onSnapshot } from '@angular/fire/firestore';
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
  @ViewChild(TextareaComponent) textareaComponent!: TextareaComponent;

  // Hier halten wir die Counts pro Message-ID
  threadCounts: Record<string, number> = {};

  private userSub!: Subscription;
  private partnerSub!: Subscription;
  private chatIdSub!: Subscription;
  private directSub!: Subscription;

  constructor(
    private channelService: ChannelService,
    private dataService: DataService,
    private firestore: Firestore,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    // eingeloggter User
    this.userSub = this.dataService.loggedUser$.subscribe(
      (u) => (this.currentUser = u)
    );

    // ausgewählter Chat-Partner
    this.partnerSub = this.channelService.selectedChatPartner$.subscribe(
      (u) => (this.selectedUser = u)
    );

    // aktueller Chat-ID
    this.chatIdSub = this.dataService.currentChatId$.subscribe((id) => {
      this.chatId = id;
      this.directSub?.unsubscribe();
      if (!id) return;

      this.directSub = this.channelService
        .listenToDirectMessages(id)
        .subscribe((msgs: any[]) => {
          // 1) Nachrichten und Zeiten mappen, ID sicherstellen
          this.directMessages = msgs.map((m) => ({
            id: m.id, // <— hier holen wir die ID mit rein
            ...m,
            reactions: Array.isArray(m.reactions) ? [...m.reactions] : [],
          }));
          this.directMessagesTime = msgs.map((m) => ({
            timestamp: m.timestamp?.toDate() ?? new Date(),
          }));

          // 2) Für jede Message einen Live-Listener auf "thread" setzen
          this.directMessages.forEach((m) => {
            if (!m.id) return; // Safety-Check
            const ref = collection(
              this.firestore,
              'directMessages',
              id,
              'messages',
              m.id,
              'replies'
            );
            onSnapshot(ref, (snap) => {
              // Zone-Run, damit ChangeDetection anspringt
              this.ngZone.run(() => {
                this.threadCounts = {
                  ...this.threadCounts,
                  [m.id]: snap.size,
                };
              });
            });
          });
        });
    });
  }

  ngAfterViewInit() {
    // Fokussiere das Eingabefeld beim ersten Rendern
    setTimeout(() => {
      this.textareaComponent?.focusTextarea();
    }, 0);
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
      this.currentUser.id,
      txt
    );
    this.textInput = '';
  }

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

  toggleReactionPicker(msg: any): void {
    msg.showPicker = msg.showPicker === msg.id ? null : msg.id;
  }

  onReactionSelected(event: any, msg: any): void {
    const emoji = event.detail.unicode || event.detail.emoji;
    if (!emoji || msg.reactions.length >= 5) return;
    if (!msg.reactions.includes(emoji)) msg.reactions.push(emoji);
    this.channelService.updateDirectMessageReactions(
      this.chatId || '',
      msg.id,
      msg.reactions // <-- vollständiges Array übergeben
    );
    msg.showPicker = null;
    // TODO: im Backend persistieren
  }

  editMessage(msg: any): void {
    msg.editing = true;
    msg.editText = msg.text;
  }

  cancelEdit(msg: any): void {
    msg.editing = false;
  }

  saveEdit(msg: any): void {
    msg.text = msg.editText;
    msg.editing = false;
    // TODO: im Backend persistieren
  }

  toggleThread(msg: any): void {
    this.dataService.sidebarThreadIsVisible = true;
    this.dataService.setCurrentThreadMessage({
      ...msg,
      chatId: this.chatId!,
    });
  }

  openMoreOptions(msg: any): void {
    // console.log('More options', msg);
  }

  removeReaction(msg: any, emoji: string): void {
    msg.reactions = msg.reactions.filter((e: string) => e !== emoji);
    if (this.chatId) {
      this.channelService
        .updateDirectMessageReactions(this.chatId, msg.id, msg.reactions)
        .catch(console.error);
    }
  }
}
