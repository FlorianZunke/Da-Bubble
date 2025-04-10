import { Component, EventEmitter, Input, Output } from '@angular/core';
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
  showUserList: boolean = false;

  constructor(
    private channelService: ChannelService,
    private dataService: DataService,
    private searchService: SearchService,
    private messageService: MessageService
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
}
