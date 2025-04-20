import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchToMessageService {
  private userIdSubject = new Subject<string>();
  userId$ = this.userIdSubject.asObservable();

  private channelIdSubject = new Subject<string>();
  channelId$ = this.channelIdSubject.asObservable();

  constructor() { }

  setUserId(userId: string) {
    this.userIdSubject.next(userId);
  }

  setChannelId(channelId:string) {
    this.channelIdSubject.next(channelId);
  }
}
