import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChannelService } from '../../firebase-services/channel.service';
import { ProfilOverlayComponent } from '../profil-overlay/profil-overlay.component';
import { DataService } from '../../firebase-services/data.service';
import { Router, RouterModule } from '@angular/router';
import { LogService } from '../../firebase-services/log.service';
import { getAuth, signOut } from 'firebase/auth';
import { User } from '../../models/user.class';

@Component({
  selector: 'app-user-drop-menu',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './user-drop-menu.component.html',
  styleUrls: ['./user-drop-menu.component.scss'],
})
export class UserDropMenuComponent {
  logedUser: User | null = null;
  readonly dialog = inject(MatDialog);

  constructor(
    private firebaseChannels: ChannelService,
    private dataService: DataService,
    private router: Router,
    private firebaseSignUp: LogService
  ) {
    this.dataService.loggedUser$.subscribe((user) => {
      this.logedUser = user;
    });
  }

  openDialog(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    const dialogHeight = 70;
    const dialogWidth = 137;
    const windowWidth = window.innerWidth;

    const positionConfig = {
      top: `${rect.bottom - dialogHeight + window.scrollY}px`,
      right: windowWidth <= 1920 ? `1rem` : `5rem`,
    };

    this.dialog.open(ProfilOverlayComponent, {
      position: positionConfig,
      panelClass: 'custom-dialog',
    });
  }

  closeDialog() {
    this.dialog.closeAll();
  }

  async logOutUser() {
    // 1) Firebase-Session beenden
    await signOut(getAuth());

    // 2) Online-Status in Firestore zurücksetzen
    if (this.logedUser?.fireId) {
      await this.firebaseSignUp.updateOnlineStatus(
        this.logedUser.fireId,
        false
      );
    }

    // 3) Local State & SessionStorage löschen
    sessionStorage.removeItem('user');
    this.dataService.setLoggedUser(null);

    // 4) Dialog schließen
    this.closeDialog();

    // 5) Zur Login-Seite navigieren
    this.router.navigate(['/login']);
  }
}
