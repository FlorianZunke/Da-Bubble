import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ChannelService } from '../../../../firebase-services/channel.service';
import { CommonModule } from '@angular/common';
import { TextareaComponent } from '../textarea/textarea.component';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../../firebase-services/data.service';

@Component({
  selector: 'app-direct-message',
  imports: [CommonModule, TextareaComponent,FormsModule],
  templateUrl: './direct-message.component.html',
  styleUrls: ['./direct-message.component.scss']
})

export class DirectMessageComponent implements OnInit, OnDestroy {
  @Input() chatId!: string;
  @Input() channelId!: string;  // Channel ID als Eingabeparameter
  messages: any[] = [];         // Nachrichten, die angezeigt werden
  currentUser: any = null;      // Der aktuell angemeldete Benutzer
  private messagesSubscription!: Subscription; // Subscription für den Echtzeit-Listener
  private currentUserSubscription!: Subscription; // Subscription für den aktuellen Benutzer

  textInput: string = '';

  constructor(private channelService: ChannelService, private dataService: DataService) {}


  onTextInputChange(newValue: string): void {
    this.textInput = newValue;  // Aktualisiere den Wert von textInput
  }
  

  ngOnInit(): void {
    // Abonniere den UserService, um den aktuellen Benutzer zu erhalten
    this.currentUserSubscription = this.dataService.logedUser$.subscribe(user => {
      this.currentUser = user;
    });

    // Starten des Echtzeit-Listeners für Nachrichten
    this.messagesSubscription = this.channelService.listenToChannelMessages(this.channelId)
      .subscribe(messages => {
        this.messages = messages;  // Nachrichten werden aktualisiert, wenn sie sich ändern
      });
  }

  ngOnDestroy(): void {
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe(); // Abbestellen der Subscription, wenn die Komponente zerstört wird
    }
    if (this.currentUserSubscription) {
      this.currentUserSubscription.unsubscribe(); // Abbestellen der User-Subscription
    }
  }
}

