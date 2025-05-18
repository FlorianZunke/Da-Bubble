import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChannelService } from '../../../../firebase-services/channel.service';
import { DataService } from '../../../../firebase-services/data.service';
import { MessageService } from '../../../../firebase-services/message.service';
import { SearchService } from '../../../../firebase-services/search.service';
import { SearchToMessageService } from '../../../../firebase-services/search-to-message.service';
import { TextareaComponent } from '../textarea/textarea.component';
import { ToggleService } from '../../../../firebase-services/toogle.service';

@Component({
  selector: 'app-new-message',
  standalone: true,
  imports: [CommonModule, TextareaComponent, FormsModule],
  templateUrl: './new-message.component.html',
  styleUrls: ['./new-message.component.scss'],
})
export class NewMessageComponent implements OnInit {
  @Input() chatId!: string;

  private dataService = inject(DataService);
  private channelService = inject(ChannelService);
  private messageService = inject(MessageService);
  private searchService = inject(SearchService);
  private searchToMessageService = inject(SearchToMessageService);
  public toggleService: ToggleService = inject(ToggleService);

  allUsers: any[] = [];
  allChannels: any[] = [];
  currentChat: { type: 'channel' | 'directMessages'; id: string } | null = null;
  currentUser: any = null;
  textInput = '';

  searchResultsUser: any[] = [];
  searchResultsChannels: any[] = [];
  searchResultsEmail: any[] = [];

  ngOnInit(): void {
    // eingeloggten User abonnieren
    this.dataService.loggedUser$.subscribe((u) => (this.currentUser = u));

    // aktuellen Chat (Channel vs. DM)
    this.channelService.currentChat$.subscribe((c) => (this.currentChat = c));

    // Benutzer- und Channel-Listen für Suche
    this.messageService.users$.subscribe((users) => (this.allUsers = users));
    this.messageService.channels$.subscribe((chs) => (this.allChannels = chs));
  }

  async openDirectChat(userId: string) {
    const chatId = await this.channelService.getOrCreateDirectChat(
      this.currentUser.id,
      userId
    );
    this.channelService.setCurrentDirectMessagesChat(chatId);
  }

  /** wird vom <app-textarea> ausgelöst */
  sendDirectMessage(event: { chatId: string; text: string }) {
    if (!this.currentUser) return;
    this.channelService.sendDirectMessage(
      event.chatId,
      this.currentUser,
      event.text
    );
  }

  /** Suche im Eingabefeld */
  onSearch(ev: any) {
    // console.log(this.currentUser);
    const term = ev.target.value.toLowerCase();
    if (term.startsWith('@')) {
      this.searchResultsUser = this.allUsers.filter((u) =>
        u.name.toLowerCase().includes(term.slice(1))
      );
    } else if (term.startsWith('#')) {
      this.searchResultsChannels = this.allChannels.filter((c) =>
        c.channelName.toLowerCase().includes(term.slice(1))
      );
    } else if (term.length > 2) {
      this.searchResultsEmail = this.allUsers.filter((u) =>
        u.email.toLowerCase().includes(term)
      );
    } else {
      this.searchResultsUser = [];
      this.searchResultsChannels = [];
      this.searchResultsEmail = [];
    }
  }

  selectChannel(item: any, input: HTMLInputElement) {
    this.searchToMessageService.setChannelId(item.id);
    this.showChannelMobile();
    input.value = '';
    this.searchResultsChannels = [];
  }

  async selectUser(item: any, inputElement: HTMLInputElement) {
    console.log('selectUser', item);

    this.searchToMessageService.setUserId(item.id);
    this.toggleService.isMobilSelectUser = true;
    this.toggleService.showDirect();
    this.searchResultsUser = [];
    this.searchResultsEmail = [];
    this.searchResultsChannels = [];
    inputElement.value = '';
  }

  showChannelMobile() {
    if (this.toggleService.isMobile) {
    this.toggleService.isMobileChannel = true;
    this.toggleService.showChannels();
    }
  }
}
