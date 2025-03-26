import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChannelService } from '../../firebase-services/channel.service';
import { UserOverlayComponent } from '../../overlays/user-overlay/user-overlay.component';

@Component({
  selector: 'app-user-drop-menu',
  imports: [],
  templateUrl: './user-drop-menu.component.html',
  styleUrl: './user-drop-menu.component.scss'
})
export class UserDropMenuComponent {

  readonly dialog = inject(MatDialog);

  constructor(private firebaseChannels: ChannelService) { }


  openDialog() {
    this.dialog.open(UserOverlayComponent);
  }
}
