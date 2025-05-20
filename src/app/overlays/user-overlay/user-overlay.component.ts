import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { LogService } from '../../firebase-services/log.service';
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from '../../models/user.class';
import { ChannelService } from '../../firebase-services/channel.service';
import { DataService } from '../../firebase-services/data.service';
import { ShowAllChannelMembersComponent } from '../show-all-channel-members/show-all-channel-members.component';
import { ToggleService } from '../../firebase-services/toogle.service';

@Component({
  selector: 'app-user-overlay',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './user-overlay.component.html',
  styleUrl: './user-overlay.component.scss'
})

export class UserOverlayComponent {

  constructor(
    private dialogRef: MatDialogRef<UserOverlayComponent>,
    private firebaseUser: LogService,
    private channelService: ChannelService,
    private dataService: DataService,
    private toggleService : ToggleService,
    @Inject(MAT_DIALOG_DATA) public data: User) { }

  /** Öffnet den Direct-Chat mit dem im `data` übergebenen User */
  async openChat() {
    // 1) Eingeloggten User holen
    const me = this.dataService.getLoggedUser();
    if (!me) {
      console.error('Kein eingeloggter User gefunden.');
      return;
    }

    // 2) Direct-Chat anlegen oder holen
    const dmChatId = await this.channelService.getOrCreateDirectChat(
      me.id.toString(),
      this.data.id.toString()      // oder ggf. data.fireId, je nachdem, welches Feld deine User-Klasse nutzt
    );

    // 3) Auf Direct-Messages umschalten
    this.channelService.setCurrentDirectMessagesChat(dmChatId);
    this.channelService.setSelectedChatPartner(this.data);

    // 4) DataService: Direct-Chat anzeigen lassen
    this.dataService.showDirectChat(dmChatId);
    this.showSelectUserMobile();

    // 5) Overlay schließen
    this.dialogRef.close();
  }

   showSelectUserMobile() {
    debugger;
    if (this.toggleService.isMobile) {
      this.toggleService.isMobilSelectUser = true;
      this.toggleService.showDirect();
    }
  }
}

