import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchToMessageService {
  private userIdSubject = new Subject<string>();
  userId$ = this.userIdSubject.asObservable();

  constructor() { }

  setUserId(userId: string) {
    this.userIdSubject.next(userId);
  }
}
