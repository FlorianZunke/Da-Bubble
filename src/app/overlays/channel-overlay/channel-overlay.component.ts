import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-channel-overlay',
  imports: [MatDialogModule, MatButtonModule, ],
  templateUrl: './channel-overlay.component.html',
  styleUrl: './channel-overlay.component.scss'
})
export class ChannelOverlayComponent {

}

