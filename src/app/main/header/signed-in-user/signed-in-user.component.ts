import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { ChannelService } from '../../../firebase-services/channel.service';
import { UserDropMenuComponent } from '../../../overlays/user-drop-menu/user-drop-menu.component';

@Component({
  selector: 'app-signed-in-user',
  imports: [MatButtonModule, MatDialogModule, MatMenuModule],
  templateUrl: './signed-in-user.component.html',
  styleUrl: './signed-in-user.component.scss'
})

export class SignedInUserComponent {

  readonly dialog = inject(MatDialog);

  constructor(private firebaseChannels: ChannelService) { }


  openDialog() {
    this.dialog.open(UserDropMenuComponent);
  }
}
