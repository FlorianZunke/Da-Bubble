import { Component } from '@angular/core';
import { DataService } from '../../firebase-services/data.service';
import { MatDialogModule } from '@angular/material/dialog';
import { LogService } from '../../firebase-services/log.service';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-edit-profile',
  imports: [MatDialogModule, FormsModule],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.scss',
})
export class EditProfileComponent {
  logedUser: any;
  newName: string = '';

  constructor(
    private dataService: DataService,
    private fireBase: LogService,
    private dialogRef: MatDialogRef<EditProfileComponent>,
  ) {
    this.dataService.logedUser$.subscribe((user) => {
      this.logedUser = user;
    });
  }

  async saveChanges() {
    await this.fireBase.updateName(this.newName, this.logedUser.fireId);
    this.logedUser.name = this.newName;
    sessionStorage.setItem('user', JSON.stringify(this.logedUser));
    // logedUser aus SessionStorage neu laden
    this.dialogRef.close();
  }
}
