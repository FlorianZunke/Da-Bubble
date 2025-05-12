import { Component, inject } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { DataService } from '../../firebase-services/data.service';
import { CommonModule } from '@angular/common';
import { EditProfileComponent } from '../edit-profile/edit-profile.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-profil-overlay',
  imports: [MatDialogModule, MatButtonModule,CommonModule],
  templateUrl: './profil-overlay.component.html',
  styleUrl: './profil-overlay.component.scss'
})
export class ProfilOverlayComponent {
  logedUser: any;
  readonly dialog = inject(MatDialog);

  constructor (private dataService : DataService) {
    this.dataService.loggedUser$.subscribe(user => {
      this.logedUser = user;
    });
  }

  openEditProfilDialog(event: MouseEvent) {
    const target = event.target as HTMLElement; // Klick-Element (das <img>)
    const rect = target.getBoundingClientRect(); // Position ermitteln
    const dialogHeight = 500;
    const dialogWidth = 137;

    const windowWidth = window.innerWidth;
    if (windowWidth <= 1920) {
      this.dialog.open(EditProfileComponent, {
        position: {
          top: `${rect.bottom - dialogHeight + window.scrollY}px`, // Unterhalb des Bildes öffnen
          // left: `${rect.left - dialogWidth + window.scrollX}px`, // Gleiche X-Position wie das Bild
            right: `1rem`, //bei screen width 1920 px
        },
        panelClass: 'custom-dialog', // Falls du CSS-Anpassungen machen willst
      });
    } else {
      this.dialog.open(EditProfileComponent, {
        position: {
          top: `95px`, // Unterhalb des Bildes öffnen
          // left: `${rect.left - dialogWidth + window.scrollX}px`, // Gleiche X-Position wie das Bild
            right: `5rem`, //bei screen width > 1920 px, hier mus gerne eine genaue formel hin
        },
        panelClass: 'custom-dialog', // Falls du CSS-Anpassungen machen willst
      });
    }
  }

}
