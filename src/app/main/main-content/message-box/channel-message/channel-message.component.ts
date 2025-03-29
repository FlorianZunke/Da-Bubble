import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from './../../../../firebase-services/data.service';

@Component({
  selector: 'app-channel-message',
  imports: [CommonModule],
  templateUrl: './channel-message.component.html',
  styleUrl: './channel-message.component.scss'
})
export class ChannelMessageComponent {
  dataService = inject(DataService);
  
}
