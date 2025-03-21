import { Component, inject } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import {
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { ChannelOverlayComponent } from '../../overlays/channel-overlay/channel-overlay.component';

@Component({
  selector: 'app-main-content',
  imports: [MatDialogModule],
  templateUrl: './main-content.component.html',
  styleUrl: './main-content.component.scss'
})

export class MainContentComponent {

  dialog = inject(MatDialog);

  openDialog() {
    this.dialog.open(ChannelOverlayComponent);
  }
}
