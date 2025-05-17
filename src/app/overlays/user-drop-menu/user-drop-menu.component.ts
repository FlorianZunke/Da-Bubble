import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ProfilOverlayComponent } from '../profil-overlay/profil-overlay.component';
import { DataService } from '../../firebase-services/data.service';
import { Router, RouterModule } from '@angular/router';
import { LogService } from '../../firebase-services/log.service';

import { ToggleService } from '../../firebase-services/toogle.service';

@Component({
  selector: 'app-user-drop-menu',
  imports: [CommonModule, RouterModule],

  templateUrl: './user-drop-menu.component.html',
  styleUrls: ['./user-drop-menu.component.scss'],
})
export class UserDropMenuComponent {
  logedUser: User | null = null;
  readonly dialog = inject(MatDialog);

  constructor(
    private dataService: DataService,
    private router: Router,
    private firebaseSignUp: LogService,
    public toggleService: ToggleService
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

    if (windowWidth <= 1920) {
      this.dialog.open(ProfilOverlayComponent, {
        position: {
          top: `${rect.bottom - dialogHeight + window.scrollY}px`, 
          right: `1rem`,
        },
        panelClass: 'custom-dialog', 
      });
    } else {
      this.dialog.open(ProfilOverlayComponent, {
        position: {
          top: `${rect.bottom - dialogHeight + window.scrollY}px`,
          right: `5rem`,
        },
        panelClass: 'custom-dialog',
      });
    }

  }

  closeDialog() {
    this.dialog.closeAll();
  }


  logOutUser() {
    this.firebaseSignUp.updateOnlineStatus(this.logedUser.fireId, false);
    this.closeDialog();
    this.dataService.setLoggedUser(null);
    this.router.navigate(['/']);

  }
}