import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { collection, getDocs } from '@angular/fire/firestore';
import { inject } from '@angular/core';
import { MessageService } from '../../../firebase-services/message.service';

@Component({
  selector: 'app-logo-and-searchbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logo-and-searchbar.component.html',
  styleUrl: './logo-and-searchbar.component.scss',
})
export class LogoAndSearchbarComponent {
  searchResults: any[] = [];
  allMessages: any[] = [];
  private messageService = inject(MessageService);

  constructor() {
    this.loadMessages();
  }

  async loadMessages() {
    this.allMessages = await this.messageService.getAllMessages();
    console.log(this.allMessages);
  }

  onSearch(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    if (searchTerm.length < 3) {
      this.searchResults = [];
      return;
    }

    this.searchResults = this.allMessages.filter(
      (msg) =>
        msg?.content?.toLowerCase().includes(searchTerm) ||
        msg?.user?.toLowerCase().includes(searchTerm)
    );
    console.log(this.searchResults, 'searchResults');
  }

}
