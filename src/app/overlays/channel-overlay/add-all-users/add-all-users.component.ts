import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Channel } from '../../../models/channel.class';
import { ChannelService } from '../../../firebase-services/channel.service';
import { DataService } from './../../../firebase-services/data.service';
import { MatSnackBar } from '@angular/material/snack-bar';
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
  users: User[] = [];
  searchTerm: string = '';
  availableUsers: User[] = [];
  renderSearchedUsers: User[] = [];
  selectedUsers: User[] = [];
  channelMembers: User[] = [];
  hideContainerSelectedUser: boolean = false;
  loggedUser: User [] = [];

  constructor(
    public dataService: DataService,
    private channelService: ChannelService,
    private messageService: MessageService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { channel: Channel }

    ) { }

  async ngOnInit() {
    await this.loadAllUsers();

    this.dataService.loggedUser$.subscribe((loggedUser) => {
      if (loggedUser) {
        this.loggedUser.push(loggedUser);
      }
    });

    if (this.searchTerm.length === 0) {
      this.renderSearchedUsers = this.availableUsers;
    }
  }

  async loadAllUsers() {
    this.availableUsers = await this.messageService.getAllUsers();
  }

  removeFromSelection(user: User) {
    this.selectedUsers = this.selectedUsers.filter((sel) => sel.fireId !== user.fireId);
    this.availableUsers.push(user);
    this.searchUser();
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

    if (this.availableUsers.length !== 0 && this.renderSearchedUsers.length !== 0) {
      this.openAddMember();
    }
  }

  addChannel(selectedOption: string) {
    try {
      if (selectedOption === 'false') {
        this.data.channel.members = this.availableUsers;
        this.channelService.addChannel(this.data.channel);
      } else {
        this.data.channel.members = [...this.selectedUsers, this.loggedUser[0]];
        this.channelService.addChannel(this.data.channel);
      }
    } catch (error) {
      this.snackBar.open('Fehler beim Erstellen des Channels.', 'Schließen', {
        duration: 3000,
      });
    }
  }
}
