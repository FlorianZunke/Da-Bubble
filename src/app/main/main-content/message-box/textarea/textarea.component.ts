/* src/app/main/main-content/message-box/textarea/textarea.component.ts */
import {
  Component,
  HostListener,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

import { ChannelService } from '../../../../firebase-services/channel.service';
import { DataService } from '../../../../firebase-services/data.service';
import { SearchService } from '../../../../firebase-services/search.service';
import { MessageService } from '../../../../firebase-services/message.service';

import { MatDialog } from '@angular/material/dialog';
import { EmojiPickerDialogComponent } from '../emoji-picker-dialog/emoji-picker-dialog.component';

@Component({
  selector: 'app-textarea',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './textarea.component.html',
  styleUrls: ['./textarea.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TextareaComponent {
  /* -------------------------------- Inputs -------------------------------- */
  @Input() mainMessageBoxPadding = '2.5rem 2.8125rem 2.5rem 2.8125rem';
  @Input() toolbarWidth = 'calc(100% - 8.125rem)';
  @Input() placeholder = '';
  @Input() textInput = '';

  /** Zwei‑Wege‑Bindung */
  @Output() textInputChange = new EventEmitter<string>();

  @ViewChild('textArea', { static: true })
  textareaElement!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('userList', { static: true })
  userList!: ElementRef<HTMLElement>;

  private usersSubject = new BehaviorSubject<any[]>([]);
  users$ = this.usersSubject.asObservable();

  chatId = '';
  currentChannelId?: string;
  currentUser: any = null;

  users: any[] = [];
  filteredUsers: any[] = [];
  mentionedUsers: any[] = [];

  showUserList = false;
  showUserListText = false;
  showEmojiPicker = false;

  cursorX = 0;
  cursorY = 0;

  constructor(
    private channelService: ChannelService,
    private dataService: DataService,
    private searchService: SearchService,
    private messageService: MessageService,
    private dialog: MatDialog
  ) {
    this.messageService.users$.subscribe((u) => this.usersSubject.next(u));
  }

  ngOnInit() {
    this.dataService.currentChatId$.subscribe((id) => (this.chatId = id || ''));
    this.dataService.logedUser$.subscribe((u) => (this.currentUser = u));
    this.channelService.currentChat$.subscribe((chat) => {
      if (chat?.type === 'channel') this.currentChannelId = chat.id;
    });
  }

  /** statt .id übergeben wir jetzt das volle User-Objekt */
  onSendClick() {
    const txt = this.textInput.trim();
    if (!txt || !this.currentUser) return;

    if (this.dataService.directMessageBoxIsVisible) {
      this.channelService.sendDirectMessage(
        this.chatId!, // Chat-ID
        this.currentUser, // komplettes User-Objekt
        txt
      );
    } else if (this.dataService.channelMessageBoxIsVisible) {
      this.channelService.sendChannelMessage(
        this.currentChannelId!,
        this.currentUser, // komplettes User-Objekt
        txt
      );
    }
    this.textInput = '';
    this.textInputChange.emit(this.textInput);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.userList?.nativeElement) return;
  
    const inside = this.userList.nativeElement.contains(event.target as Node);
    if (!inside) {
      this.showUserList = this.showUserListText = this.showEmojiPicker = false;
    }
  }

  onListClick(event: MouseEvent) {
    event.stopPropagation();
  }

  /* ----------------------------- Mentions ----------------------------- */
  selectUser(user: any) {
    if (this.mentionedUsers.some((u) => u.id === user.id)) return;
    this.mentionedUsers.push(user);

    const ta = this.textareaElement.nativeElement;
    const pos = ta.selectionStart;
    const before = this.textInput.slice(0, pos);
    const after = this.textInput.slice(pos);
    const atIdx = before.lastIndexOf('@');

    if (atIdx >= 0) {
      this.textInput = before.slice(0, atIdx) + '@' + user.name + ' ' + after;
      setTimeout(() => {
        const newPos = atIdx + user.name.length + 2;
        ta.setSelectionRange(newPos, newPos);
        ta.focus();
      });
    } else {
      this.textInput += `@${user.name} `;
    }

    this.textInputChange.emit(this.textInput);
    this.showUserList = this.showUserListText = false;
  }

  showUsers() {
    const ta = this.textareaElement.nativeElement;
    this.showUserListAtCursor(ta, ta.selectionStart, '');
  }

  onTag(event: any) {
    const ta = event.target as HTMLTextAreaElement;
    const pos = ta.selectionStart;
    const before = this.textInput.slice(0, pos);
    const atIdx = before.lastIndexOf('@');
    if (atIdx >= 0) {
      const tagText = before.slice(atIdx + 1);
      this.showUserListAtCursor(ta, pos, tagText);
    } else {
      this.showUserListText = false;
    }
    this.textInputChange.emit(this.textInput);
  }

  private showUserListAtCursor(
    textarea: HTMLTextAreaElement,
    caretPos: number,
    tagText = ''
  ) {
    this.users$.subscribe((users) => {
      this.users = users;
      this.filteredUsers = users.filter(
        (u) =>
          u.name.toLowerCase().includes(tagText.toLowerCase()) &&
          !this.mentionedUsers.some((m) => m.id === u.id)
      );
      this.showUserListText = true;

      const { offsetLeft, offsetTop } = textarea;
      const { x, y } = this.getCaretCoordinates(textarea, caretPos);
      this.cursorX = x + offsetLeft;
      this.cursorY = y + offsetTop;
    });
  }

  /* --------------------------- Emoji‑Picker -------------------------- */
  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  onEmojiClick(event: any) {
    const emoji = event.detail.unicode || event.detail.emoji;
    if (emoji) {
      this.textInput += emoji;
      this.textInputChange.emit(this.textInput);
    }
    this.showEmojiPicker = false;
  }

  openEmojiPicker() {
    const dlg = this.dialog.open(EmojiPickerDialogComponent, {
      width: '400px',
    });
    dlg.afterClosed().subscribe((res) => {
      if (res) {
        this.textInput += res;
        this.textInputChange.emit(this.textInput);
      }
    });
  }

  /* ---------------------------- Misc ---------------------------- */
  onInput() {
    this.textInputChange.emit(this.textInput);
    const tags = Array.from(this.textInput.matchAll(/@(\w+)/g)).map(
      (m) => m[1]
    );
    this.mentionedUsers = this.mentionedUsers.filter((u) =>
      tags.includes(u.name)
    );
  }

  private getCaretCoordinates(
    textarea: HTMLTextAreaElement,
    pos: number
  ): { x: number; y: number } {
    const div = document.createElement('div');
    const span = document.createElement('span');
    const style = getComputedStyle(textarea);

    for (const prop of style) {
      div.style.setProperty(prop, style.getPropertyValue(prop));
    }

    Object.assign(div.style, {
      position: 'absolute',
      visibility: 'hidden',
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word',
      width: `${textarea.offsetWidth}px`,
      height: `${textarea.offsetHeight}px`,
    });

    div.textContent = textarea.value.substring(0, pos);
    span.textContent = '\u200b';
    div.appendChild(span);
    document.body.appendChild(div);

    const { offsetLeft: x, offsetTop: y } = span;
    document.body.removeChild(div);
    return { x, y };
  }
}
