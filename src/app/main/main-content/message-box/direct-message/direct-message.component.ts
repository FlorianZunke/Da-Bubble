import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ChannelService } from '../../../../firebase-services/channel.service';
import { AuthService } from '../../../../firebase-services/auth.service';
import { CommonModule } from '@angular/common';
import { TextareaComponent } from '../textarea/textarea.component';

@Component({
  selector: 'app-direct-message',
  imports: [CommonModule, TextareaComponent],
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

  constructor(private channelService: ChannelService, private authService: AuthService) {}

  ngOnInit(): void {
    // Abonniere den UserService, um den aktuellen Benutzer zu erhalten
    this.currentUserSubscription = this.authService.currentUser$.subscribe(user => {
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

