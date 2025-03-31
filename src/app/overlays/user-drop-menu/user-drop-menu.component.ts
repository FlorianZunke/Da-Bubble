import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChannelService } from '../../firebase-services/channel.service';
import { ProfilOverlayComponent } from '../profil-overlay/profil-overlay.component';

@Component({
  selector: 'app-user-drop-menu',
  imports: [],
  templateUrl: './user-drop-menu.component.html',
  styleUrl: './user-drop-menu.component.scss'
})
export class UserDropMenuComponent {

  readonly dialog = inject(MatDialog);

  constructor(private firebaseChannels: ChannelService) { }


  openDialog(event: MouseEvent) {
    const target = event.target as HTMLElement;  // Klick-Element (das <img>)
    const rect = target.getBoundingClientRect(); // Position ermitteln
    const dialogHeight = 70;
    const dialogWidth = 137;
  
    this.dialog.open(ProfilOverlayComponent, {
      position: {
        top: `${rect.bottom - dialogHeight + window.scrollY}px`,  // Unterhalb des Bildes öffnen
        left: `${rect.left - dialogWidth + window.scrollX}px`   // Gleiche X-Position wie das Bild
      },
      panelClass: 'custom-dialog' // Falls du CSS-Anpassungen machen willst
    });
  }
}
