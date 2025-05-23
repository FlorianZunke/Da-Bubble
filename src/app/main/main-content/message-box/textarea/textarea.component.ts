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
  @ViewChild('inputElement') inputElementRef!: ElementRef<HTMLTextAreaElement>;

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

  highlightedText: string = '';

  constructor(
    private channelService: ChannelService,
    private dataService: DataService,
    private messageService: MessageService,
    private dialog: MatDialog
  ) {
    this.messageService.users$.subscribe((u) => this.usersSubject.next(u));
  }

  ngOnInit() {
    this.dataService.currentChatId$.subscribe((id) => (this.chatId = id || ''));
    this.dataService.loggedUser$.subscribe((u) => (this.currentUser = u));
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
    this.messageService.updateMessages(); // Aktualisiere die Nachrichten
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

    // Stelle sicher, dass @ direkt vor dem Cursor liegt (also nicht Teil eines bereits ersetzten Namens)
    const isAtMention = atIdx >= 0 && /^[\S]*$/.test(before.slice(atIdx));

    let insertText = `@${user.name}`;
    if (isAtMention) {
      this.textInput = before.slice(0, atIdx) + insertText + after;
    } else {
      this.textInput = before + insertText + after;
    }

    // Cursor nach dem eingefügten Tag positionieren
    setTimeout(() => {
      const newPos = (isAtMention ? atIdx : pos) + insertText.length;
      ta.setSelectionRange(newPos, newPos);
      ta.focus();
    });

    this.textInputChange.emit(this.textInput);
    this.syncMentionedUsersWithText();
    this.showUserList = this.showUserListText = false;
  }

  showUsers() {
    if (this.showUserListText) {
      this.showUserListText = false;
      return;
    }
    const ta = this.textareaElement.nativeElement;
    this.showUserListAtCursor(ta, ta.selectionStart, '');
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

  private syncMentionedUsersWithText() {
    const mentionedIdsInText = this.mentionedUsers
      .filter((user) => this.textInput.includes(`@${user.name}`))
      .map((user) => user.id);

    this.mentionedUsers = this.mentionedUsers.filter((user) =>
      mentionedIdsInText.includes(user.id)
    );
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

  // Extrahiere alle aktuellen Tags aus dem Text
  const tags = Array.from(this.textInput.matchAll(/@([^\n@]+?)(?=\s|$)/g)).map(
    (m) => m[1].trim()
  );

  // Gehe alle User in `mentionedUsers` durch und überprüfe, ob sie noch im Text sind
  this.mentionedUsers = this.mentionedUsers.filter((u) =>
    tags.includes(u.name)
  );

  // Füge alle User hinzu, die im Text sind, aber noch nicht in `mentionedUsers` enthalten sind
  const newMentions = tags.filter(
    (tag) => !this.mentionedUsers.some((u) => u.name === tag)
  );

  newMentions.forEach((tag) => {
    const user = this.users.find((u) => u.name === tag);
    if (user) {
      this.mentionedUsers.push(user);
    }
  });

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

  focusTextarea() {
    setTimeout(() => {
      this.inputElementRef?.nativeElement?.focus();
    }, 0);
  }


}
