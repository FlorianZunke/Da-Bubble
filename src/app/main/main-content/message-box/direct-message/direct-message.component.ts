import {
  Component,
  OnInit,
  OnDestroy,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { ChannelService } from '../../../../firebase-services/channel.service';
import { CommonModule } from '@angular/common';
import { TextareaComponent } from '../textarea/textarea.component';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../../firebase-services/data.service';

@Component({
  selector: 'app-direct-message',
  standalone: true,
  imports: [CommonModule, TextareaComponent, FormsModule],
  templateUrl: './direct-message.component.html',
  styleUrls: ['./direct-message.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DirectMessageComponent implements OnInit, OnDestroy {
  directMessages: any[] = [];
  directMessagesTime: { timestamp: string }[] = [];
  currentUser: any = null;
  selectedUser: any = null;
  chatId: any = null;
  textInput = '';

  private directSub!: Subscription;
  private userSub!: Subscription;

  // Für Reactions
  reactionPickerMessageId: string | null = null;
  // Für Edit
  editingMessageId: string | null = null;
  editingText = '';

  constructor(
    private channelService: ChannelService,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.userSub = this.dataService.logedUser$.subscribe((u) => {
      this.currentUser = u;
    });

    this.channelService.selectedChatPartner$.subscribe(
      (user) => (this.selectedUser = user)
    );

    this.dataService.currentChatId$.subscribe((id) => {
      this.chatId = id;
      this.directSub?.unsubscribe();
      this.directSub = this.channelService
        .listenToDirectMessages(this.chatId)
        .subscribe((msgs) => {
          this.directMessages = msgs.map((m) => ({
            ...m,
            reactions: Array.isArray(m.reactions) ? [...m.reactions] : [],
          }));
          this.directMessagesTime = msgs.map((m) => ({
            timestamp: m.timestamp.toDate(),
          }));
        });
    });
  }

  ngOnDestroy(): void {
    this.directSub?.unsubscribe();
    this.userSub?.unsubscribe();
  }

  // Datumsgrouping
  shouldShowDate(ts: string, idx: number): boolean {
    if (idx === 0) return true;
    return (
      this.dateKey(ts) !==
      this.dateKey(this.directMessagesTime[idx - 1].timestamp)
    );
  }
  private dateKey(ts: string): string {
    const d = new Date(ts);
    return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}`;
  }

  // Reactions
  toggleReactionPicker(msg: any) {
    this.reactionPickerMessageId =
      this.reactionPickerMessageId === msg.id ? null : msg.id;
  }
  onReactionSelected(event: any, msg: any) {
    const emoji = event.detail.unicode || event.detail.emoji;
    if (emoji && !msg.reactions.includes(emoji)) {
      msg.reactions.push(emoji);
      // TODO: push to backend via channelService.updateReaction(...)
    }
    this.reactionPickerMessageId = null;
  }

  // Edit
  editMessage(msg: any) {
    this.editingMessageId = msg.id;
    this.editingText = msg.text;
  }
  cancelEdit() {
    this.editingMessageId = null;
  }
  saveEdit(msg: any) {
    msg.text = this.editingText;
    this.editingMessageId = null;
    // TODO: speichern im Backend, z.B.:
    // this.channelService.updateDirectMessage(this.chatId, msg.id, this.editingText);
  }

  // Delete stub
  deleteMessage(msg: any) {
    // TODO: löschen via channelService.deleteDirectMessage(...)
    console.log('Delete', msg);
  }
}
