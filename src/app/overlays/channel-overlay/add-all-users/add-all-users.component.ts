import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Channel } from '../../../models/channel.class';
import { ChannelService } from '../../../firebase-services/channel.service';
import { FormsModule } from '@angular/forms';
import { LogService } from '../../../firebase-services/log.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

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
  searchInput: string = '';

  constructor(
    private dialog: MatDialog,
    private logService: LogService,
    private firebaseChannels: ChannelService, 
    @Inject(MAT_DIALOG_DATA) public data: { channel: Channel }
  ) {  }

  ngOnInit() {
    this.logService.users$.subscribe((users) => {
      this.users = users; 
    });
  }

  addChannel(selectedOption: string) {
    if (selectedOption === 'false') {
      this.data.channel.members = this.users;
      this.firebaseChannels.addChannel(this.data.channel);
    }

    if (selectedOption === 'true') {
      let userNames: string[] = [];
      let userFireId: string[] = [];

      for (let i = 0; i < this.users.length; i++) {
        const name = this.users[i].name;
        const fireId = this.users[i].fireId;
        console.log(name);
        if (name.toLowerCase().includes(this.searchInput.toLowerCase())) {
          userNames.push(name);
          userFireId.push(fireId);
        }
      }


console.log(userNames);

    }
  }
}