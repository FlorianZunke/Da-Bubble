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
import { Subscription } from 'rxjs';
import { Firestore, collection, onSnapshot } from '@angular/fire/firestore';
import { ChannelService } from '../../../../firebase-services/channel.service';
import { DataService } from '../../../../firebase-services/data.service';
import { TextareaComponent } from '../textarea/textarea.component';
import { SearchToMessageService } from '../../../../firebase-services/search-to-message.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MessageService } from '../../../../firebase-services/message.service';
import { User } from '../../../../models/user.class';
import { ToggleService } from '../../../../firebase-services/toogle.service';

@Component({
  selector: 'app-direct-message',
  standalone: true,
  imports: [CommonModule, TextareaComponent, FormsModule],
  templateUrl: './direct-message.component.html',
  styleUrls: ['./direct-message.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DirectMessageComponent implements OnInit, OnDestroy {
  /* ───────────── Properties ───────────── */
  directMessages: any[] = [];
  directMessagesTime: { timestamp: Date }[] = [];

  currentUser: User | null = null;
  /** sofort auf ein Objekt initialisieren → Template-Prüfer meckert nicht mehr */
  selectedUser: User | Record<string, never> = {};

  chatId: string | null = null;
  textInput = '';

  usersMap: Record<string, User> = {};
  allUsers: User[] = [];

  /** Thread-Antwortenzähler pro Message-ID */
  threadCounts: Record<string, number> = {};

  @ViewChild(TextareaComponent) textareaComponent!: TextareaComponent;

  /* ───────────── Subscriptions ───────────── */
  private userSub!: Subscription;
  private partnerSub!: Subscription;
  private chatIdSub!: Subscription;
  private directSub!: Subscription;

  constructor(
    private channelService: ChannelService,
    private dataService: DataService,
    private firestore: Firestore,
    private ngZone: NgZone,
    private searchToMessageService: SearchToMessageService,
    private sanitizer: DomSanitizer,
    private messageService: MessageService,
    private toggleService: ToggleService
  ) {}

  /* ───────────── Lifecycle ───────────── */
  ngOnInit(): void {
    /* eingeloggter User */
    this.userSub = this.dataService.loggedUser$.subscribe(
      (u) => (this.currentUser = u)
    );

    /* ausgewählter Chat-Partner */
    this.partnerSub = this.channelService.selectedChatPartner$.subscribe(
      (u) => (this.selectedUser = u ?? {})
    );

    /* globale User-Map */
    this.messageService.getAllUsers().then((users) => {
      const map: Record<string, User> = {};
      users.forEach((u) => (map[u.id] = u));
      this.usersMap = map;
    });
    this.messageService.users$.subscribe((users) => (this.allUsers = users));

    /* Nachrichten-Listener */
    this.chatIdSub = this.dataService.currentChatId$.subscribe((id) => {
      this.chatId = id;
      this.directSub?.unsubscribe();
      if (!id) return;

      this.directSub = this.channelService
        .listenToDirectMessages(id)
        .subscribe((msgs) => {
          this.directMessages = msgs.map((m) => ({
            id: m.id,
            ...m,
            reactions: Array.isArray(m.reactions) ? [...m.reactions] : [],
          }));
          this.directMessagesTime = msgs.map((m) => ({
            timestamp: m.timestamp?.toDate() ?? new Date(),
          }));

          /* Thread-Counter pro Message */
          this.directMessages.forEach((m) => {
            if (!m.id) return;
            const ref = collection(
              this.firestore,
              'directMessages',
              id,
              'messages',
              m.id,
              'replies'
            );
            onSnapshot(ref, (snap) =>
              this.ngZone.run(
                () =>
                  (this.threadCounts = {
                    ...this.threadCounts,
                    [m.id]: snap.size,
                  })
              )
            );
          });
        });
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.textareaComponent?.focusTextarea(), 0);
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
    this.partnerSub?.unsubscribe();
    this.chatIdSub?.unsubscribe();
    this.directSub?.unsubscribe();
  }

  /* ───────────── Senden ───────────── */
  onSendClick(): void {
    const txt = this.textInput.trim();
    if (!txt || !this.currentUser || !this.chatId) return;

    /** jetzt das **ganze User-Objekt** übergeben */
    this.channelService.sendDirectMessage(this.chatId, this.currentUser, txt);
    this.textInput = '';
  }

  /* ───────────── Helfer ───────────── */
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

  /* ---------------- Reactions ---------------- */
  toggleReactionPicker(msg: any): void {
    msg.showPicker = msg.showPicker === msg.id ? null : msg.id;
  }
  onReactionSelected(e: any, msg: any): void {
    const emoji = e.detail.unicode || e.detail.emoji;
    if (!emoji || msg.reactions.length >= 5 || msg.reactions.includes(emoji))
      return;
    msg.reactions.push(emoji);
    this.channelService.updateDirectMessageReactions(
      this.chatId!,
      msg.id,
      msg.reactions
    );
    msg.showPicker = null;
  }
  removeReaction(msg: any, emoji: string): void {
    msg.reactions = msg.reactions.filter((e: string) => e !== emoji);
    this.channelService.updateDirectMessageReactions(
      this.chatId!,
      msg.id,
      msg.reactions
    );
  }

  /* ---------------- Edit ---------------- */
  editMessage(msg: any): void {
    msg.editing = true;
    msg.editText = msg.text;
  }
  cancelEdit(msg: any): void {
    msg.editing = false;
  }
  saveEdit(msg: any): void {
    msg.text = msg.editText.trim();
    msg.editing = false;
  }

  /* ---------------- Thread ---------------- */
  toggleThread(msg: any): void {
    this.dataService.sidebarThreadIsVisible = true;
    this.dataService.setCurrentThreadMessage({ ...msg, chatId: this.chatId! });
  }

  /* ───────────── @Mentions ───────────── */
  transformMentionsToHtml(text: string): SafeHtml {
    const regex = /@([\w]+(?: [\w]+)?)/g;
    return this.sanitizer.bypassSecurityTrustHtml(
      text.replace(
        regex,
        (_, u) => `<span class="mention-chip" data-username="${u}">@${u}</span>`
      )
    );
  }

  /** ein einzelner Klick reicht – dank `mousedown` + `preventDefault()` */
  handleMentionClick(e: MouseEvent): void {
    e.preventDefault();
    const t = e.target as HTMLElement;
    if (!t.classList.contains('mention-chip')) return;

    const username = t.dataset['username'];
    if (!username) return;

    const user = this.allUsers.find((u) => u.name === username);
    if (!user) return;

    /* ID als **String** setzen */
    this.searchToMessageService.setUserId(user.id.toString());

    if (this.toggleService.isMobile) {
      this.toggleService.isMobilSelectUser = true;
      this.toggleService.showDirect();
    }
  }
}
