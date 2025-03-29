import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-profil-overlay',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './profil-overlay.component.html',
  styleUrl: './profil-overlay.component.scss'
})
export class ProfilOverlayComponent {

}
