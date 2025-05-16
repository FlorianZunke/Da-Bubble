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
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, MatMenuModule, CommonModule],
  templateUrl: './signed-in-user.component.html',
  styleUrls: ['./signed-in-user.component.scss'],
})
export class SignedInUserComponent implements OnInit, OnDestroy {
  logedUser: User | null = null;
  private sub = new Subscription();
  readonly dialog = inject(MatDialog);

  constructor(
    private dataService: DataService,

//     private router: Router,
    public toggleService: ToggleService,
//   ) {}
//     public toggleService: ToggleService,

    private firebaseChannels: ChannelService,
    private router: Router
  ) {}

  // async ngOnInit() {
  //   this.logedUser = await this.loadlogedUserFromSessionStorage();
  //   if (this.logedUser) {
  //     this.dataService.setLoggedUser(this.logedUser);
  //     this.firebaseChannels.setLoggedUser(this.logedUser);
  //   } else {
  //     this.router.navigate(['login']);
  //   }



ngOnInit() {
    // 1) Abonnieren des aktuellen Users
    console.log(this.logedUser);


    this.sub = this.dataService.loggedUser$.subscribe((user) => {
      if (user) {
        this.logedUser = user;
        // ggf. auch in ChannelService pushen
        this.firebaseChannels.setLoggedUser(user);
      } else {
        // Kein User → zurück zum Login
        this.router.navigate(['login']);
      }
    });
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
}
