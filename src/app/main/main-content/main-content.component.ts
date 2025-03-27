import { Component } from '@angular/core';
import { ToggleSidebarDevspaceComponent } from './toggle-sidebar-devspace/toggle-sidebar-devspace.component';
import { SidebarDevspaceComponent } from './sidebar-devspace/sidebar-devspace.component';
import { NewMessageComponent } from './message-box/new-message/new-message.component';
import { SidebarThreadComponent } from './sidebar-thread/sidebar-thread.component';
import { HeaderComponent } from '../header/header.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-content',
  imports: [ToggleSidebarDevspaceComponent, SidebarDevspaceComponent, NewMessageComponent, SidebarThreadComponent, HeaderComponent],
  templateUrl: './main-content.component.html',
  styleUrl: './main-content.component.scss'
})

export class MainContentComponent {

  constructor(private router: Router) {}

}
