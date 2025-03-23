import { Component } from '@angular/core';
import { ToggleSidebarDevspaceComponent } from './toggle-sidebar-devspace/toggle-sidebar-devspace.component';
import { SidebarDevspaceComponent } from './sidebar-devspace/sidebar-devspace.component';
import { MessageBoxComponent } from './message-box/message-box.component';
import { SidebarThreadComponent } from './sidebar-thread/sidebar-thread.component';

@Component({
  selector: 'app-main-content',
  imports: [ToggleSidebarDevspaceComponent, SidebarDevspaceComponent, MessageBoxComponent, SidebarThreadComponent],
  templateUrl: './main-content.component.html',
  styleUrl: './main-content.component.scss'
})
export class MainContentComponent {

}
