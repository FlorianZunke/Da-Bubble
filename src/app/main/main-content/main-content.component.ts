import { Component } from '@angular/core';
import { ToggleSidebarDevspaceComponent } from './toggle-sidebar-devspace/toggle-sidebar-devspace.component';
import { SidebarDevspaceComponent } from './sidebar-devspace/sidebar-devspace.component';
import { NewMessageComponent } from './message-box/new-message/new-message.component';
import { SidebarThreadComponent } from './sidebar-thread/sidebar-thread.component';

@Component({
  selector: 'app-main-content',
  imports: [ToggleSidebarDevspaceComponent, SidebarDevspaceComponent, NewMessageComponent, SidebarThreadComponent],
  templateUrl: './main-content.component.html',
  styleUrl: './main-content.component.scss'
})
export class MainContentComponent {

}
