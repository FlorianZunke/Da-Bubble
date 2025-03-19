import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChannelOverlayComponent } from "./overlays/channel-overlay/channel-overlay.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ChannelOverlayComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'DA-Bubble';
}
