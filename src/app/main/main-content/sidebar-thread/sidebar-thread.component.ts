/* src/app/main/main-content/sidebar-thread/sidebar-thread.component.ts */
import {
  Component,
  OnInit,
  OnDestroy,
  CUSTOM_ELEMENTS_SCHEMA,
  ViewChild,
  ElementRef,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, of, Subscription } from 'rxjs';
import { DataService } from '../../../firebase-services/data.service';
import { ChannelService } from '../../../firebase-services/channel.service';
import { User } from '../../../models/user.class';
import { MessageService } from '../../../firebase-services/message.service';
import { ToggleService } from '../../../firebase-services/toogle.service';

@Component({
  selector: 'app-sidebar-thread',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sidebar-thread.component.html',
  styleUrls: ['./sidebar-thread.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SidebarThreadComponent implements OnInit, OnDestroy {
  @ViewChild('replyTA') replyTA!: ElementRef<HTMLTextAreaElement>;

  threadMsg: any = null; // Root-Nachricht
  replies$: Observable<any[]> = of([]); // Replies-Stream
  replyText = ''; // Inhalt Textarea
  showEmoji = false; // Picker sichtbar?
  reactionTarget: any = null; // Nachricht für Reaction
  currentUser: any = null;
  sidebarVisible: boolean = false;
  private subs: Subscription[] = [];

  constructor(
    public dataService: DataService,
    private channelService: ChannelService,
    private messageService: MessageService,
    public toggleService: ToggleService
  ) {}

  /* ───────── init ────────────────────────────────────── */
  async ngOnInit() {
    this.checkScreenWidth();
    this.loadThreadMessages();
    this.currentUser = await this.loadlogedUserFromSessionStorage();

    //console.log(this.currentUser);
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  /* ───────── UI-Helfer ───────────────────────────────── */
  closeThread(): void {
    this.dataService.sidebarThreadIsVisible = false;
    this.dataService.setCurrentThreadMessage(null);
  }

  formatDate(d: any): string {
    const dt = d?.toDate?.() ?? new Date(d);
    return dt.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' });
  }

  private focusTextarea(): void {
    setTimeout(() => this.replyTA?.nativeElement.focus(), 0);
  }

  /* ───────── Reaction-Picker öffnen ─────────────────── */
  openReactionPickerFor(msg: any): void {
    this.reactionTarget = msg; // merken, welche Nachricht reagiert wird
    this.showEmoji = true;
  }

  /* ───────── Nachricht senden ───────────────────────── */
  async sendThreadReply(): Promise<void> {
    const text = this.replyText.trim();
    if (!text || !this.threadMsg?.id) return;

    const sender = this.dataService.getLoggedUser() as User | null;
    if (!sender) {
      console.warn('kein User');
      return;
    }

    try {
      if (this.threadMsg.channelId) {
        await this.channelService.sendThreadReply(
          this.threadMsg.channelId,
          this.threadMsg.id,
          sender,
          text
        );
      } else if (this.threadMsg.chatId) {
        await this.channelService.sendDmThreadReply(
          this.threadMsg.chatId,
          this.threadMsg.id,
          sender,
          text
        );
      }
      this.replyText = '';
      this.showEmoji = false;
      this.focusTextarea();
      this.messageService.updateMessages();
    } catch (e) {
      console.error('Firestore-Fehler', e);
    }
  }

  /* ───────── Emoji-Picker ───────────────────────────── */
  toggleEmoji(): void {
    /* manuelles Öffnen ohne Target → für Textarea */
    this.reactionTarget = null;
    this.showEmoji = !this.showEmoji;
    if (!this.reactionTarget && this.showEmoji) this.focusTextarea();
  }

  onEmoji(ev: any): void {
    const emoji = ev.detail?.unicode || ev.detail?.emoji;
    if (!emoji) return;

    /* Reaction an Nachricht anhängen */
    if (this.reactionTarget) {
      const arr = this.reactionTarget.reactions ?? [];
      if (!arr.includes(emoji) && arr.length < 5) arr.push(emoji);

      const promise = this.threadMsg?.channelId
        ? this.channelService.updateThreadReplyReactions(
            this.threadMsg.channelId,
            this.threadMsg.id,
            this.reactionTarget.id,
            arr
          )
        : this.channelService.updateDmThreadReplyReactions(
            this.threadMsg.chatId,
            this.threadMsg.id,
            this.reactionTarget.id,
            arr
          );

      promise.catch(console.error);
    } else {
      /* kein Target → Emoji in Textarea */
      this.replyText += emoji;
      this.focusTextarea();
    }

    /* Picker zu & Target reset */
    this.reactionTarget = null;
    this.showEmoji = false;
  }

  /* ───────── Reaction entfernen ─────────────────────── */
  removeReaction(msg: any, emoji: string): void {
    msg.reactions = (msg.reactions ?? []).filter((r: string) => r !== emoji);

    const promise = this.threadMsg?.channelId
      ? this.channelService.updateThreadReplyReactions(
          this.threadMsg.channelId,
          this.threadMsg.id,
          msg.id,
          msg.reactions
        )
      : this.channelService.updateDmThreadReplyReactions(
          this.threadMsg.chatId,
          this.threadMsg.id,
          msg.id,
          msg.reactions
        );

    promise.catch(console.error);
  }

  //von Alex aus ngOnInit-Sidebar-Thread genommen und seperat gepackt
  loadThreadMessages(): void {
    this.subs.push(
      this.dataService.currentThreadMessage$.subscribe((msg) => {
        this.threadMsg = msg;

        /* passenden Listener wählen */
        if (msg?.channelId && msg.id) {
          this.replies$ = this.channelService.listenToThreadReplies(
            msg.channelId,
            msg.id
          );
        } else if (msg?.chatId && msg.id) {
          this.replies$ = this.channelService.listenToDmThreadReplies(
            msg.chatId,
            msg.id
          );
        } else {
          this.replies$ = of([]);
        }
      })
    );
  }

  async loadlogedUserFromSessionStorage() {
    const user = sessionStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      return parsedUser;
    } else {
      // console.log('No user found in session storage.');
      return null;
    }
  }

  @HostListener('window:resize', [])
  onResize() {
    this.checkScreenWidth();
  }

  checkScreenWidth() {
    if (window.innerWidth <= 799) {
      this.dataService.sidebarThreadIsVisible = true;
    } else if (window.innerWidth <= 1440) {
      this.dataService.sidebarThreadIsVisible = false;
    }
   
    if (this.dataService.sidebarDevspaceIsVisible && this.dataService.sidebarThreadIsVisible && window.innerWidth <= 1440) {
      this.dataService.sidebarThreadIsVisible = false;
    }
  }
}