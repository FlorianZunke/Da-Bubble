import { Component, inject } from '@angular/core';
import { DataService } from './../../../../firebase-services/data.service';
import { TextareaComponent } from '../textarea/textarea.component';

@Component({
  selector: 'app-direct-message',
  imports: [TextareaComponent],
  templateUrl: './direct-message.component.html',
  styleUrl: './direct-message.component.scss'
})
export class DirectMessageComponent {
  dataService = inject(DataService);
}
