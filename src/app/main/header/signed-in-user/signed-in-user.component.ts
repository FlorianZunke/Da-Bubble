import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ChannelService } from '../../../firebase-services/channel.service';
import { DataService } from '../../../firebase-services/data.service';
import { ToggleService } from '../../../firebase-services/toogle.service';
import { UserDropMenuComponent } from '../../../overlays/user-drop-menu/user-drop-menu.component';
import { User } from '../../../models/user.class';

@Component({
  selector: 'app-signed-in-user',
  imports: [MatButtonModule, MatDialogModule, MatMenuModule, CommonModule],
  templateUrl: './signed-in-user.component.html',
  styleUrl: './signed-in-user.component.scss',
})
export class SignedInUserComponent implements OnInit, OnDestroy {
  logedUser: User | null = null;
  private sub: Subscription = new Subscription();

  readonly dialog = inject(MatDialog);

  constructor(
    private firebaseChannels: ChannelService,
    private dataService: DataService,
    private router: Router,
    public toggleService: ToggleService
  ) {}

  async ngOnInit() {
    this.logedUser = await this.loadlogedUserFromSessionStorage();
    if (this.logedUser) {
      this.dataService.setLoggedUser(this.logedUser);
      this.firebaseChannels.setLoggedUser(this.logedUser);
    } else {
      this.router.navigate(['login']);
    }
  }

  openDialog(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    const dialogWidth = 282;

    this.dialog.open(UserDropMenuComponent, {
      position: {
        top: `${rect.bottom + window.scrollY}px`,
        left: `${rect.right - dialogWidth + window.scrollX}px`,
      },
      panelClass: 'custom-dialog',
    });
  }

  openDialogMobile(event: MouseEvent) {
    if (this.toggleService.isMobile) {
      const target = event.target as HTMLElement;
      const rect = target.getBoundingClientRect();
      const dialogWidth = 282;

      this.dialog.open(UserDropMenuComponent, {
        position: {
          top: `${rect.bottom + window.scrollY}px`,
          left: `${rect.right - dialogWidth + window.scrollX}px`,
        },
        panelClass: 'custom-dialog',
      });
    }
  }


  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  async loadlogedUserFromSessionStorage() {
    const user = sessionStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      return parsedUser;
    } else {
      return null;
    }

  }
}

