import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from './../../../../firebase-services/data.service';
import { TextareaComponent } from '../textarea/textarea.component';

@Component({
  selector: 'app-channel-message',
  imports: [CommonModule, TextareaComponent],
  templateUrl: './channel-message.component.html',
  styleUrl: './channel-message.component.scss'
})
export class ChannelMessageComponent {
  dataService = inject(DataService);
  
}
