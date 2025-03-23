import { Component } from '@angular/core';
import { HeaderComponent } from './main/header/header.component';
import { MainContentComponent } from './main/main-content/main-content.component';
import { RouterOutlet } from '@angular/router';
import { ChannelOverlayComponent } from "./overlays/channel-overlay/channel-overlay.component";


@Component({
  selector: 'app-root',
  // imports: [RouterOutlet, ChannelOverlayComponent, HeaderComponent, MainContentComponent],
  imports: [HeaderComponent, MainContentComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'DA-Bubble';
}
