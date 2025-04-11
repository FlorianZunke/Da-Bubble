import {
  Component,
  EventEmitter,
  Input,
  Output,
  HostListener,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChannelService } from '../../../../firebase-services/channel.service';
import { AuthService } from '../../../../firebase-services/auth.service';
import { Subscription } from 'rxjs';
import { DataService } from '../../../../firebase-services/data.service';
import { SearchService } from '../../../../firebase-services/search.service';
import { BehaviorSubject } from 'rxjs';
import { MessageService } from '../../../../firebase-services/message.service';

@Component({
  selector: 'app-textarea',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './textarea.component.html',
  styleUrl: './textarea.component.scss',
})
export class TextareaComponent {
  @Input() mainMessageBoxPadding: string = '2.5rem 2.8125rem 2.5rem 2.8125rem';
  @Input() toolbarWidth: string = 'calc(100% - 8.125rem)';
  @Input() placeholder: string = '';
  @Input() textInput: string = '';
  private usersSubject = new BehaviorSubject<any[]>([]);

  chatId: string = '';
  senderId: string = '';

  users$ = this.usersSubject.asObservable();
  users: any[] = [];
  filteredUsers: any[] = [];
  taggedUsers: any[] = [];
  mentionedUsers: any[] = [];
  showUserList: boolean = false;
  showUserListText: boolean = false;
  cursorX: number = 0;
  cursorY: number = 0;

  constructor(
    private channelService: ChannelService,
    private dataService: DataService,
    private searchService: SearchService,
    private messageService: MessageService,
    private userList: ElementRef
  ) {
    this.messageService.users$.subscribe((users) => {
      this.usersSubject.next(users);
    });
  }

  ngOnInit() {
    this.dataService.currentChatId$.subscribe((chatId) => {
      this.chatId = chatId || '';
    });

    this.dataService.logedUser$.subscribe((senderId) => {
      this.senderId = senderId || '';
    });
  }

  onSendClick() {
    if (this.textInput.trim()) {
      console.log(
        'die argumente sind:',
        this.chatId,
        this.senderId,
        this.textInput
      );

      this.channelService.sendDirectMessage(
        this.chatId,
        this.senderId,
        this.textInput
      );
      this.textInput = ''; // Eingabefeld leeren
    }
  }

  showUsers() {
    this.showUserList = !this.showUserList;
    if (this.showUserList) {
      this.users$.subscribe((users) => {
        console.log('Userliste geladen:', users);
      });
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const clickedInside = this.userList.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.showUserList = false; // Schließe das Fenster
      this.showUserListText = false; // Schließe das Fenster
    }
  }

  onListClick(event: MouseEvent) {
    event.stopPropagation();
  }

  selectUser(user: any) {
    // Prüfe, ob der User bereits getaggt wurde
    if (!this.mentionedUsers.some(u => u.id === user.id)) {
      this.mentionedUsers.push(user);
    } else {
      return; // Abbrechen, falls schon getaggt
    }

    const caretPosition = this.textInput.length;
    const atIndex = this.textInput.lastIndexOf('@');

    if (atIndex >= 0) {
      const before = this.textInput.substring(0, atIndex);
      const after = this.textInput.substring(caretPosition);
      this.textInput = `${before}@${user.name} ${after}`;
    } else {
      this.textInput += `@${user.name} `;
    }

    this.showUserList = false;
    this.showUserListText = false;
  }


  onTag(event: any) {
    const caretPosition = event.target.selectionStart;
    const valueUntilCaret = this.textInput.substring(0, caretPosition);
    const atIndex = valueUntilCaret.lastIndexOf('@');

    if (atIndex >= 0) {
      const tagText = valueUntilCaret.substring(atIndex + 1);

      this.users$.subscribe((users) => {
        this.users = users;

        this.filteredUsers = this.users.filter((user) =>
          user.name.toLowerCase().includes(tagText.toLowerCase()) &&
          !this.mentionedUsers.some((u) => u.id === user.id)
        );

        this.showUserListText = true;

        // ✨ Cursorposition berechnen (relativ zum Textfeld)
        const textarea = event.target as HTMLTextAreaElement;
        const { offsetLeft, offsetTop } = textarea;
        const { x, y } = this.getCaretCoordinates(textarea, caretPosition);

        this.cursorX = x + offsetLeft;
        this.cursorY = y + offsetTop;
      });
    } else {
      this.showUserListText = false;
    }
  }

  getCaretCoordinates(textarea: HTMLTextAreaElement, position: number) {
    const div = document.createElement('div');
    const span = document.createElement('span');

    const style = getComputedStyle(textarea);
    for (const prop of style) {
      div.style.setProperty(prop, style.getPropertyValue(prop));
    }

    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.whiteSpace = 'pre-wrap';
    div.style.wordWrap = 'break-word';
    div.style.width = textarea.offsetWidth + 'px';
    div.style.height = textarea.offsetHeight + 'px';

    const text = textarea.value.substring(0, position);
    div.textContent = text;
    span.textContent = '\u200b';
    div.appendChild(span);

    document.body.appendChild(div);
    const { offsetLeft: x, offsetTop: y } = span;
    document.body.removeChild(div);

    return { x, y };
  }


}
