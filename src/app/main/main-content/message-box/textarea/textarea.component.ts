import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChannelService } from '../../../../firebase-services/channel.service';
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
  currentChannelId: string | undefined = '';

  constructor(private channelService: ChannelService, private dataService: DataService) { }

  ngOnInit() {
    this.dataService.currentChatId$.subscribe(chatId => {
      this.chatId = chatId || '';
    });

    this.dataService.logedUser$.subscribe(senderId => {
      this.senderId = senderId || '';
    });

    this.channelService.currentChat$.subscribe(chat => {
      if (chat && chat.type === 'channel') {
        this.currentChannelId = chat.id;
      }
    });
  }


  onSendClick() {
    if (this.textInput.trim()) {
      if (this.dataService.directMessageBoxIsVisible) {
        this.channelService.sendDirectMessage(this.chatId, this.senderId, this.textInput);
      } else if (this.dataService.channelMessageBoxIsVisible) {
        this.channelService.sendChannelMessage(this.currentChannelId, this.senderId, this.textInput);
        console.log('Argumente:', this.currentChannelId, this.senderId, this.textInput);
      }
      this.textInput = '';
    }
  }

}