import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-user-overlay',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './user-overlay.component.html',
  styleUrl: './user-overlay.component.scss'
})
export class UserOverlayComponent {

}
