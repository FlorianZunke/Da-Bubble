import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-textarea',
  imports: [CommonModule],
  templateUrl: './textarea.component.html',
  styleUrl: './textarea.component.scss'
})
export class TextareaComponent {
  @Input() mainMessageBoxPadding: string = '2.5rem 2.8125rem 2.5rem 2.8125rem';
  @Input() toolbarWidth: string = 'calc(100% - 8.125rem)';
  @Input() placeholder: string = '';
}
