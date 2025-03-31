import { Component } from '@angular/core';
import { TextareaComponent } from '../textarea/textarea.component';

@Component({
  selector: 'app-new-message',
  imports: [TextareaComponent],
  templateUrl: './new-message.component.html',
  styleUrl: './new-message.component.scss'
})
export class NewMessageComponent {

}
