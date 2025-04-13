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
  imports: [CommonModule, TextareaComponent, FormsModule],
  templateUrl: './direct-message.component.html',
  styleUrls: ['./direct-message.component.scss']
})

export class DirectMessageComponent implements OnInit, OnDestroy {
  directMessages: any[] = [];
  currentUser: any = null;      // Der aktuell angemeldete Benutzer
  isSelfChat: boolean = true;
  selectedUser: any = null;
  chatId: any = null;
  private directMessagesSubscription!: Subscription; // Subscription für den Echtzeit-Listener
  private currentUserSubscription!: Subscription; // Subscription für den aktuellen Benutzer

  textInput: string = '';

  constructor(private channelService: ChannelService, private dataService: DataService, private logService: LogService) { }


  onTextInputChange(newValue: string): void {
    this.textInput = newValue;  // Aktualisiere den Wert von textInput
  }


  ngOnInit(): void {

    // Abonniere den aktuellen Chat-Partner
    this.channelService.selectedChatPartner$.subscribe(user => {
      if (user) {
        this.selectedUser = user;
        this.isSelfChat = this.selectedUser?.id === this.currentUser?.id;
      }
    });

    // Abonniere den aktuellen Chat-ID und setze den Nachrichten-Listener
    this.dataService.currentChatId$.subscribe(chatId => {
      this.chatId = chatId;

      // Vorherige Subscription abbestellen, falls vorhanden
      if (this.directMessagesSubscription) {
        this.directMessagesSubscription.unsubscribe();
      }

      // Neuen Nachrichten-Listener setzen
      this.directMessagesSubscription = this.channelService.listenToDirectMessages(this.chatId)
        .subscribe(directMessages => {
          this.directMessages = [...directMessages]; // Neue Referenz für Change Detection
        });
    });

    // Abonniere den aktuell angemeldeten Benutzer
    this.currentUserSubscription = this.dataService.logedUser$.subscribe(loggedUser => {
      this.currentUser = loggedUser;
      this.isSelfChat = this.selectedUser?.id === this.currentUser?.id;
    });
  }


  ngOnDestroy(): void {
    if (this.directMessagesSubscription) {
      this.directMessagesSubscription.unsubscribe();
    }
    if (this.currentUserSubscription) {
      this.currentUserSubscription.unsubscribe();
    }
  }
}

