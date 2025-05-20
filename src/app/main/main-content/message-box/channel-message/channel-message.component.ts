/* src/app/main/main-content/message-box/channel-message/channel-message.component.ts */

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
import { EditChannelComponent } from '../../../../overlays/edit-channel/edit-channel.component';
import { AddUserToChannelComponent } from '../../../../overlays/add-user-to-channel/add-user-to-channel.component';
import { Channel } from '../../../../models/channel.class';
import { User } from '../../../../models/user.class';

import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SearchToMessageService } from '../../../../firebase-services/search-to-message.service';
import { UserOverlayComponent } from '../../../../overlays/user-overlay/user-overlay.component';
import { ShowAllChannelMembersComponent } from '../../../../overlays/show-all-channel-members/show-all-channel-members.component';

import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-channel-message',
  standalone: true,
  imports: [
    CommonModule,
    TextareaComponent,
    FormsModule,
    MatDialogModule,
    MatTooltipModule,
    MatSelectModule,
    MatFormFieldModule,
  ],
  templateUrl: './channel-message.component.html',
  styleUrls: ['./channel-message.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ChannelMessageComponent implements OnInit, OnDestroy, OnChanges {
  /*──────────────────────── Inputs & Grunddaten ─────────────────────*/
  @Input() channelId!: string;

  channelMessages: any[] = [];
  channelMessagesTime: { timestamp: Date }[] = [];
  currentChannel: Channel | null = null;
  currentUser!: User | null;

  /** komplette Mitglieder-Liste */
  public allUsers: User[] = [];

  /** schnelle Look-ups */
  usersMap: Record<string, User> = {}; // id → User (für Template)
  private usersByName: Record<string, User> = {}; // name.toLowerCase() → User

  @ViewChild(TextareaComponent) textareaComponent!: TextareaComponent;

  reactionPickerMessageId: string | null = null;
  editingMessageId: string | null = null;
  editingText = '';

  private channelMsgsSub!: Subscription;
  private currentUserSub!: Subscription;
  private allUsersSub!: Subscription;
  private threadCountSubs: Subscription[] = [];

  /*──────────────────────── Constructor ─────────────────────────────*/
  constructor(
    private channelService: ChannelService,
    private messageService: MessageService,
    private dataService: DataService,
    private dialog: MatDialog,
    public toggleService: ToggleService,
    private sanitizer: DomSanitizer,
    private searchToMessageService: SearchToMessageService
  ) {}

  get displayChannelName(): string {
    return this.dataService.displayChannelName;
  }

  /*──────────────────────── Lifecycle ───────────────────────────────*/
  ngOnInit(): void {
    /* 1) alle User laden */
    this.messageService.getAllUsers().then((u) => {
      this.setUsers(u);
    });
    /* live-Updates */
    this.allUsersSub = this.messageService.users$.subscribe((u) => {
      this.setUsers(u);
    });

    /* 2) eingeloggter User */
    this.currentUserSub = this.dataService.loggedUser$.subscribe(
      (u) => (this.currentUser = u)
    );

    /* 3) Channel-Wechsel */
    this.channelService.currentChat$.subscribe((chat) => {
      if (chat?.type === 'channel') {
        this.channelId = chat.id;
        this.refreshChannelData();
      }
    });
  }

  ngOnChanges(c: SimpleChanges): void {
    if (c['channelId']?.currentValue) {
      this.channelId = c['channelId'].currentValue;
      this.refreshChannelData();
    }
  }

  ngAfterViewInit() {
    setTimeout(() => this.textareaComponent?.focusTextarea(), 1000);
  }

  ngOnDestroy(): void {
    this.channelMsgsSub?.unsubscribe();
    this.currentUserSub?.unsubscribe();
    this.allUsersSub?.unsubscribe();
    this.threadCountSubs.forEach((s) => s.unsubscribe());
  }

  /*──────────────────────── User-Maps ───────────────────────────────*/
  private setUsers(users: User[]) {
    this.allUsers = users;

    const byId: Record<string, User> = {};
    const byName: Record<string, User> = {};
    users.forEach((u) => {
      byId[u.id] = u;
      byName[u.name.toLowerCase().trim()] = u;
    });
    this.usersMap = byId; // fürs Template
    this.usersByName = byName; // für Mentions
  }

  /*──────────────────────── Channel-Daten ───────────────────────────*/
  private refreshChannelData() {
    if (!this.channelId) return;
    this.updateChannelMessages();
    this.loadChannelName(this.channelId);
    this.listenToChannelDoc(this.channelId);
  }

  private updateChannelMessages(): void {
    if (!this.channelId) return;

    this.threadCountSubs.forEach((s) => s.unsubscribe());
    this.threadCountSubs = [];

    this.channelMsgsSub?.unsubscribe();
    this.channelMsgsSub = this.channelService
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

        /* Thread-Counter live */
        this.channelMessages.forEach((msg) => {
          const sub = this.channelService
            .listenToThreadReplies(this.channelId, msg.id)
            .subscribe((r) => (msg.threadCount = r.length));
          this.threadCountSubs.push(sub);
        });
      });
  }

  private loadChannelName(id: string): void {
    this.channelService
      .loadChannel(id)
      .then((ch) => (this.currentChannel = ch as Channel))
      .catch(console.error);
  }

  private listenToChannelDoc(id: string): void {
    this.channelService.listenToChannel(id).subscribe((ch) => {
      this.currentChannel = ch;
    });
  }

  /*────────────────────── Edit / Reactions / Thread ─────────────────*/
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

  /*──────────────────────── Datum ───────────────────────────────────*/
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

  /*──────────────────────── Mention-Handling ───────────────────────*/
  transformMentionsToHtml(text: string): SafeHtml {
    const regex = /@([\p{L}\d._-]+(?:\s[\p{L}\d._-]+)*)/giu; // erlaubt mehrere Namens-Teile
    const parsed = text.replace(regex, (_m, uname) => {
      const clean = uname.trim();
      return `<span class="mention-chip" data-username="${clean}">@${clean}</span>`;
    });
    return this.sanitizer.bypassSecurityTrustHtml(parsed);
  }

  handleMentionClick(event: MouseEvent): void {
    event.preventDefault(); // Default-Aktion (Text-Auswahl) unterbinden
    event.stopPropagation(); // Bubble-Phase hier beenden ⇒ kein Überschreiben

    const el = event.target as HTMLElement;
    if (!el.classList.contains('mention-chip')) return;

    const raw = (el.dataset['username'] || '').toLowerCase().trim();
    const user = this.usersByName[raw];
    if (user) {
      this.openDirectChatWith(user); // wie gehabt
    }
  }

  private async openDirectChatWith(user: User) {
    if (!this.currentUser) return;
    try {
      const dmId = await this.channelService.getOrCreateDirectChat(
        this.currentUser.id.toString(),
        user.id.toString()
      );
      this.channelService.setCurrentDirectMessagesChat(dmId);
      this.channelService.setSelectedChatPartner(user);
      this.dataService.showDirectChat(dmId);

      if (this.toggleService.isMobile) {
        this.toggleService.isMobilSelectUser = false;
        this.toggleService.showDirect();
      }
    } catch (e) {
      console.error(e);
    }
  }

  /*──────────────────────── Dialoge / Overlays ─────────────────────*/
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

  async openProfil(userId: string) {
    const user = this.usersMap[userId];
    if (!user) return;

    this.dialog.open(UserOverlayComponent, {
      width: '300px',
      data: user,
    });
  }

  openShowAllMembersDialog(channelMembers: any) {
    this.dialog.open(ShowAllChannelMembersComponent, {
      width: '300px',
      data: { channelMembers },
    });
  }

  /*──────────────────────── Mobile-Switches─────────────────────────*/
  showMobilThread() {
    if (this.toggleService.isMobile) {
      this.toggleService.isMobileChannel = true;
      this.toggleService.isMobilThread = true;
      this.toggleService.showThreads();
    }
  }

  openThreadCloseSidebar() {
    if (
      !this.toggleService.isMobile &&
      this.dataService.sidebarThreadIsVisible
    ) {
      this.dataService.toggleSidebarDevspace();
      this.toggleService.showThreads();
    }
  }
}
