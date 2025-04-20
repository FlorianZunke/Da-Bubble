import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ChannelService } from '../../../../firebase-services/channel.service';
import { CommonModule } from '@angular/common';
import { TextareaComponent } from '../textarea/textarea.component';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../../firebase-services/data.service';
import { LogService } from '../../../../firebase-services/log.service';

@Component({
  selector: 'app-direct-message',
  standalone: true,
  imports: [CommonModule, TextareaComponent, FormsModule],
  templateUrl: './direct-message.component.html',
  styleUrls: ['./direct-message.component.scss'],
})
export class DirectMessageComponent implements OnInit, OnDestroy {
  directMessages: any[] = [];
  currentUser: any = null; // Aktuell angemeldeter Benutzer
  isSelfChat: boolean = true;
  selectedUser: any = null;
  chatId: any = null;
  private directMessagesSubscription!: Subscription;
  private currentUserSubscription!: Subscription;

  textInput: string = '';

  constructor(
    private channelService: ChannelService,
    private dataService: DataService,
    private logService: LogService
  ) {}

  onTextInputChange(newValue: string): void {
    this.textInput = newValue;
  }

  ngOnInit(): void {
    // Abonniere den aktuellen Chat-Partner
    this.channelService.selectedChatPartner$.subscribe((user) => {
      if (user) {
        this.selectedUser = user;
        this.isSelfChat = this.selectedUser?.id === this.currentUser?.id;
      }
    });

    // Abonniere den aktuellen Chat-ID und setze den Nachrichten-Listener
    this.dataService.currentChatId$.subscribe((chatId) => {
      this.chatId = chatId;
      if (this.directMessagesSubscription) {
        this.directMessagesSubscription.unsubscribe();
      }
      this.directMessagesSubscription = this.channelService
        .listenToDirectMessages(this.chatId)
        .subscribe((directMessages) => {
          this.directMessages = [...directMessages];
        });
    });

    // Abonniere den aktuell angemeldeten Benutzer
    this.currentUserSubscription = this.dataService.logedUser$.subscribe(
      (loggedUser) => {
        this.currentUser = loggedUser;
        this.isSelfChat = this.selectedUser?.id === this.currentUser?.id;
      }
    );
  }

  ngOnDestroy(): void {
    if (this.directMessagesSubscription) {
      this.directMessagesSubscription.unsubscribe();
    }
    if (this.currentUserSubscription) {
      this.currentUserSubscription.unsubscribe();
    }
  }

  // Action Menü Methoden
  editMessage(message: any): void {
    console.log('Edit message:', message);
    // Hier Logik zum Bearbeiten einfügen
  }

  addReaction(message: any): void {
    console.log('Add reaction to message:', message);
    // Hier Logik zum Reagieren einfügen
  }

  deleteMessage(message: any): void {
    console.log('Delete message:', message);
    // Hier Logik zum Löschen einfügen
  }
}
