import { Component, inject } from '@angular/core';
import { DataService } from './../../../../firebase-services/data.service';

@Component({
  selector: 'app-direct-message',
  imports: [],
  templateUrl: './direct-message.component.html',
  styleUrl: './direct-message.component.scss'
})
export class DirectMessageComponent {
  dataService = inject(DataService);
}
