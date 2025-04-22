// src/app/main/main-content/sidebar-thread/sidebar-thread.component.ts
import {
  Component,
  OnInit,
  OnDestroy,
  CUSTOM_ELEMENTS_SCHEMA,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, of, Subscription } from 'rxjs';

import { DataService } from '../../../firebase-services/data.service';
import { ChannelService } from '../../../firebase-services/channel.service';
import { User } from '../../../models/user.class';

@Component({
  selector: 'app-sidebar-thread',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sidebar-thread.component.html',
  styleUrls: ['./sidebar-thread.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SidebarThreadComponent implements OnInit, OnDestroy {
  @ViewChild('replyTA') replyTA!: ElementRef<HTMLTextAreaElement>;

  threadMsg: any = null;
  replies$: Observable<any[]> = of([]);
  replyText = '';

  showEmoji = false;

  private subs: Subscription[] = [];

  constructor(
    public dataService: DataService,
    private channelService: ChannelService
  ) {}

  ngOnInit(): void {
    this.subs.push(
      this.dataService.currentThreadMessage$.subscribe((msg) => {
        this.threadMsg = msg;
        if (msg) {
          this.replies$ = this.channelService.listenToThreadReplies(
            msg.channelId ?? '',
            msg.id
          );
        } else {
          this.replies$ = of([]);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  closeThread(): void {
    this.dataService.sidebarThreadIsVisible = false;
    this.dataService.setCurrentThreadMessage(null);
  }

  sendThreadReply(): void {
    if (!this.threadMsg) return;

    const txt = this.replyText.trim();
    if (!txt) return;

    // raw kann je nach Implementation ein User-Objekt oder eine ID sein
    const raw = this.dataService.getLogedUser();
    // hier casten wir zwangsweise zu User, um die TS-Signatur zu erfüllen
    const sender = raw as User;

    this.channelService
      .sendThreadReply(
        this.threadMsg.channelId ?? '',
        this.threadMsg.id,
        sender,
        txt
      )
      .catch((err) => console.error('Thread‑Reply fehlgeschlagen:', err));

    this.replyText = '';
    this.showEmoji = false;
    this.focusTextarea();
  }

  toggleEmoji(): void {
    this.showEmoji = !this.showEmoji;
    if (this.showEmoji) {
      this.focusTextarea();
    }
  }

  onEmoji(ev: any): void {
    const e = ev.detail?.unicode || ev.detail?.emoji;
    if (e) {
      this.replyText += e;
      this.focusTextarea();
    }
    this.showEmoji = false;
  }

  /** öffentlich, damit es im Template aufrufbar ist */
  public focusTextarea(): void {
    setTimeout(() => this.replyTA?.nativeElement.focus(), 0);
  }

  formatDate(d: Date | string): string {
    const dt = new Date(d);
    return dt.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' });
  }
}
