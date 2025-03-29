import { Component,Input } from '@angular/core';

@Component({
  selector: 'app-direct-message',
  imports: [],
  templateUrl: './direct-message.component.html',
  styleUrl: './direct-message.component.scss'
})
export class DirectMessageComponent {
  @Input() userId!: string;
}
