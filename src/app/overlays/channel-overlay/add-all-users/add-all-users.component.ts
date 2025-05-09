import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Channel } from '../../../models/channel.class';
import { ChannelService } from '../../../firebase-services/channel.service';
import { MessageService } from '../../../firebase-services/message.service';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from '../../../models/user.class';

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
  searchTerm: string = '';
  availableUsers: User[] = [];
  renderSearchedUsers: User[] = [];
  selectedUsers: User[] = [];
  channelMembers: User[] = [];
  hideContainerSelectedUser: boolean = false;

  constructor(
    private channelService: ChannelService, 
    private messageService: MessageService,
    @Inject(MAT_DIALOG_DATA) public data: { channel: Channel }
    ) {}

  async ngOnInit() {
    await this.loadAllUsers();

    if (this.searchTerm.length === 0) {
      this.renderSearchedUsers = this.availableUsers;   
    }
  }

  async loadAllUsers() {
    this.availableUsers = await this.messageService.getAllUsers();
    console.log('Fetched available users:', this.availableUsers);
  }

  removeFromSelection(user: User) {
    this.selectedUsers = this.selectedUsers.filter((sel) => sel.fireId !== user.fireId);
    this.availableUsers.push(user);
    this.searchUser();
    console.log('this.availableUsers', this.availableUsers);
    console.log('this.selectedUsers', this.selectedUsers);
  }

  searchUser() {
    const input = this.searchTerm.toLowerCase();
    this.renderSearchedUsers = this.availableUsers.filter(availableUser => availableUser.name.toLowerCase().includes(input));
  }

  openAddMember() {
    document.getElementById('usermenu')?.classList.remove('d-hidden');
  }
  closeAddMember() {
    document.getElementById('usermenu')?.classList.add('d-hidden');
  }

  addToSelection(user: User) {
    if (!this.selectedUsers.find((sel) => sel.fireId === user.fireId)) {
      this.selectedUsers.push(user);

      this.renderSearchedUsers = this.renderSearchedUsers.filter(
        (u) => u.fireId !== user.fireId
      );

      this.availableUsers = this.availableUsers.filter(
        (u) => u.fireId !== user.fireId
      );
      
      console.log('this.availableUsers', this.availableUsers);
      console.log('this.renderSearchedUsers', this.renderSearchedUsers);
      console.log('this.selectedUsers', this.selectedUsers);

    }
     this.searchUser();
  }

  hideSelectedUser() {
    this.hideContainerSelectedUser = !this.hideContainerSelectedUser;
  }

  onFocus() {
    if (this.hideContainerSelectedUser === true) {
      this.hideContainerSelectedUser = false;  
    }
    console.log('this.availableUsers',this.availableUsers);
    console.log('this.renderSearchedUsers',this.renderSearchedUsers);

    if (this.availableUsers.length !== 0 && this.renderSearchedUsers.length !== 0) { 
      this.openAddMember();
    }
  }

  addChannel(selectedOption: string) {
    if (selectedOption === 'false') {
      this.data.channel.members = this.availableUsers;
      this.channelService.addChannel(this.data.channel);
    } else {
      this.data.channel.members = this.selectedUsers;
      this.channelService.addChannel(this.data.channel);
    }
  }
}