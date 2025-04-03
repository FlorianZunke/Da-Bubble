import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { DataService } from '../../firebase-services/data.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profil-overlay',
  imports: [MatDialogModule, MatButtonModule,CommonModule],
  templateUrl: './profil-overlay.component.html',
  styleUrl: './profil-overlay.component.scss'
})
export class ProfilOverlayComponent {
  logedUser: any;

  constructor (private dataService : DataService) {
    this.dataService.logedUser$.subscribe(user => {
      this.logedUser = user;
    });
  }

}
