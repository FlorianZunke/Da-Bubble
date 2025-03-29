import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-channel-message',
  imports: [],
  templateUrl: './channel-message.component.html',
  styleUrl: './channel-message.component.scss'
})
export class ChannelMessageComponent {
  @Input() channelId!: string;
}
