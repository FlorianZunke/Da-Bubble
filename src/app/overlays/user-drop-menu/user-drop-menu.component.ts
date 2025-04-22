import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChannelService } from '../../firebase-services/channel.service';
import { ProfilOverlayComponent } from '../profil-overlay/profil-overlay.component';
import { DataService } from '../../firebase-services/data.service';
import { Router, RouterModule } from '@angular/router';
import { LogService } from '../../firebase-services/log.service';

@Component({
  selector: 'app-user-drop-menu',
  imports: [RouterModule],
  templateUrl: './user-drop-menu.component.html',
  styleUrl: './user-drop-menu.component.scss',
})
export class UserDropMenuComponent {
  logedUser: any;
  readonly dialog = inject(MatDialog);

  constructor(
    private firebaseChannels: ChannelService,
    private dataService: DataService,
    private router: Router,
    private firebaseSignUp: LogService
  ) {
    this.dataService.logedUser$.subscribe((user) => {
      this.logedUser = user;
    });
  }

  openDialog(event: MouseEvent) {
    const target = event.target as HTMLElement; // Klick-Element (das <img>)
    const rect = target.getBoundingClientRect(); // Position ermitteln
    const dialogHeight = 70;
    const dialogWidth = 137;

    const windowWidth = window.innerWidth;
    if (windowWidth <= 1920) {
      this.dialog.open(ProfilOverlayComponent, {
        position: {
          top: `${rect.bottom - dialogHeight + window.scrollY}px`, // Unterhalb des Bildes öffnen
          // left: `${rect.left - dialogWidth + window.scrollX}px`, // Gleiche X-Position wie das Bild
          right: `1rem`, //bei screen width 1920 px
        },
        panelClass: 'custom-dialog', // Falls du CSS-Anpassungen machen willst
      });
    } else {
      this.dialog.open(ProfilOverlayComponent, {
        position: {
          top: `${rect.bottom - dialogHeight + window.scrollY}px`, // Unterhalb des Bildes öffnen
          // left: `${rect.left - dialogWidth + window.scrollX}px`, // Gleiche X-Position wie das Bild
          right: `5rem`, //bei screen width > 1920 px, hier mus gerne eine genaue formel hin
        },
        panelClass: 'custom-dialog', // Falls du CSS-Anpassungen machen willst
      });
    }

    // this.dialog.open(ProfilOverlayComponent, {
    //   position: {
    //     top: `${rect.bottom - dialogHeight + window.scrollY}px`, // Unterhalb des Bildes öffnen
    //     // left: `${rect.left - dialogWidth + window.scrollX}px`, // Gleiche X-Position wie das Bild
    //       right: `1rem`, //bei screen width 1920 px
    //   },
    //   panelClass: 'custom-dialog', // Falls du CSS-Anpassungen machen willst
    // });
  }

  closeDialog() {
    this.dialog.closeAll();
  }

  logOutUser() {
    this.firebaseSignUp.updateOnlineStatus(this.logedUser.fireId, false);
    this.closeDialog();
    sessionStorage.removeItem('user');
    this.dataService.setLogedUser(null);
    this.router.navigate(['/']);
  }
}
