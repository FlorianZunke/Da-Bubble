import { Component } from '@angular/core';
import { DataService } from '../../firebase-services/data.service';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-edit-profile',
  imports: [MatDialogModule],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.scss'
})
export class EditProfileComponent {
  logedUser: any;

  constructor ( private dataService: DataService) {
    this.dataService.logedUser$.subscribe(user => {
      this.logedUser = user;
    });
  }

}
