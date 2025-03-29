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


  openDialog(event: MouseEvent) {
    const target = event.target as HTMLElement;  // Klick-Element (das <img>)
    const rect = target.getBoundingClientRect(); // Position ermitteln
    const dialogWidth = 282;
  
    this.dialog.open(UserDropMenuComponent, {
      position: {
        top: `${rect.bottom + window.scrollY}px`,  // Unterhalb des Bildes öffnen
        left: `${rect.right - dialogWidth + window.scrollX}px`   // Gleiche X-Position wie das Bild
      },
      panelClass: 'custom-dialog' // Falls du CSS-Anpassungen machen willst
    });
  }
}
