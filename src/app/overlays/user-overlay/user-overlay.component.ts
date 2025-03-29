import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { LogService } from '../../firebase-services/log.service';

@Component({
  selector: 'app-user-overlay',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './user-overlay.component.html',
  styleUrl: './user-overlay.component.scss'
})

export class UserOverlayComponent {

  constructor(private firebaseUser: LogService) { }

}
