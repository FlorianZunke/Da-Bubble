import { Component } from '@angular/core';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-add-all-users',
  imports: [CommonModule, FormsModule, MatRadioModule, MatDialogModule],
  templateUrl: './add-all-users.component.html',
  styleUrl: './add-all-users.component.scss'
})
export class AddAllUsersComponent {
  showInput = false;

  constructor(
    private dialog: MatDialog
  ) { }

  toggleInput() {
    this.showInput = !this.showInput;
  }
  
}
