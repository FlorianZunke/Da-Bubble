import { Component, inject } from '@angular/core';
import { DataService } from '../../firebase-services/data.service';
import { MatDialogModule } from '@angular/material/dialog';
import { LogService } from '../../firebase-services/log.service';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { EditAvatarComponent } from '../edit-avatar/edit-avatar.component';

@Component({
  selector: 'app-edit-profile',
  imports: [MatDialogModule, FormsModule],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.scss',
})
export class EditProfileComponent {
  logedUser: any;
  newName: string = '';
  newPicture: string = '';
  readonly dialog = inject(MatDialog);

  constructor(
    private dataService: DataService,
    private fireBase: LogService,
    private dialogRef: MatDialogRef<EditProfileComponent>,
  ) {
    this.dataService.loggedUser$.subscribe((user) => {
      this.logedUser = user;
    });
  }

  async saveChanges() {
    await this.fireBase.updateName(this.newName, this.logedUser.fireId);
    this.logedUser.name = this.newName;
    sessionStorage.setItem('user', JSON.stringify(this.logedUser));
    this.dialogRef.close();
  }

  async openAvatarImgs() {
    this.dialog.open(EditAvatarComponent)
    // Hier noch die Component edit-avatar öffnen

    // await this.fireBase.updatePicture(this.newPicture, this.logedUser.fireId);
    // this.logedUser.picture = this.newPicture;
    // sessionStorage.setItem('user', JSON.stringify(this.logedUser));
    // this.dialogRef.close();
  }
}
