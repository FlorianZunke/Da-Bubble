import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChannelService } from '../../../../firebase-services/channel.service';
import { AuthService } from '../../../../firebase-services/auth.service';
import { Subscription } from 'rxjs';
import { DataService } from '../../../../firebase-services/data.service';

@Component({
  selector: 'app-textarea',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './textarea.component.html',
  styleUrl: './textarea.component.scss'
})
export class TextareaComponent {
  @Input() mainMessageBoxPadding: string = '2.5rem 2.8125rem 2.5rem 2.8125rem';
  @Input() toolbarWidth: string = 'calc(100% - 8.125rem)';
  @Input() placeholder: string = '';
  @Input() textInput: string = '';

  chatId: string = '';
  senderId: string = '';

  constructor(private channelService: ChannelService, private dataService: DataService) { }

  ngOnInit() {
    this.dataService.currentChatId$.subscribe(chatId => {
      this.chatId = chatId || '';
    });

    this.dataService.logedUser$.subscribe(senderId => {
      this.senderId = senderId || '';
    });
  }


  onSendClick() {
    if (this.textInput.trim()) {
      console.log('die argumente sind:', this.chatId, this.senderId, this.textInput);

      this.channelService.sendDirectMessage(this.chatId, this.senderId, this.textInput);
      this.textInput = ''; // Eingabefeld leeren
    }
  }
}