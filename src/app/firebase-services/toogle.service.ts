import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})


export class ToggleService {
  isMobile: boolean = false;
  isMobileNewMessage: boolean = false;
  isMobileChannel: boolean = false;
  isMobilSelectUser: boolean = false;
  isMobilThread: boolean = false;
  sidebarIsVisible: boolean = false;

  mobileView: 'direct' | 'sidebar' | 'channels' | 'newMessage' | 'threads'  = 'sidebar';

  showDirect() {
    this.mobileView = 'direct';
  }

  showSidebar() {
    this.mobileView = 'sidebar';
  }

  showChannels() {
    this.mobileView = 'channels';
  }

  showNewMessage() {
    this.mobileView = 'newMessage';
  }

  showThreads() {
    this.mobileView = 'threads';
  }
}