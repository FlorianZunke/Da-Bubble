import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from './../../../../firebase-services/data.service';
import { TextareaComponent } from '../textarea/textarea.component';

@Component({
  selector: 'app-direct-message',
  imports: [CommonModule ,TextareaComponent],
  templateUrl: './direct-message.component.html',
  styleUrl: './direct-message.component.scss'
})
export class DirectMessageComponent {
  dataService = inject(DataService);
}
