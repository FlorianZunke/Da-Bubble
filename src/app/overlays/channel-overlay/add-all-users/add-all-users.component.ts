import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LogService } from '../../../firebase-services/log.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  standalone: true,
  selector: 'app-add-all-users',
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './add-all-users.component.html',
  styleUrl: './add-all-users.component.scss'
})
export class AddAllUsersComponent {
  selectedOption: string = "false";
  users: any[] = [];
  allUserNames: any[] = []; 

  constructor(
    private dialog: MatDialog,
    private logService: LogService
  ) {  }

  ngOnInit() {
    this.logService.users$.subscribe((users) => {
      this.users = users; 
      const allUserNames = users.map(user => user.name);
      console.log('Alle Benutzerdaten: ', allUserNames);
    });
  }
}