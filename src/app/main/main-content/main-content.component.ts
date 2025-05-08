import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToggleSidebarDevspaceComponent } from './toggle-sidebar-devspace/toggle-sidebar-devspace.component';
import { SidebarDevspaceComponent } from './sidebar-devspace/sidebar-devspace.component';
import { NewMessageComponent } from './message-box/new-message/new-message.component';
import { DirectMessageComponent } from './message-box/direct-message/direct-message.component';
import { ChannelMessageComponent } from './message-box/channel-message/channel-message.component';
import { SidebarThreadComponent } from './sidebar-thread/sidebar-thread.component';
import { HeaderComponent } from '../header/header.component';
import { Router } from '@angular/router';
import { DataService } from './../../firebase-services/data.service';
import { ToggleService } from '../../firebase-services/toogle.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { LayoutModule } from '@angular/cdk/layout'; 

@Component({
  selector: 'app-main-content',
  imports: [CommonModule, ToggleSidebarDevspaceComponent, SidebarDevspaceComponent, NewMessageComponent, DirectMessageComponent, ChannelMessageComponent, SidebarThreadComponent, HeaderComponent, LayoutModule],
  templateUrl: './main-content.component.html',
  styleUrl: './main-content.component.scss'
})

export class MainContentComponent {
  dataService = inject(DataService);
  isHandset = false;
  
  constructor( private bpo: BreakpointObserver, private router: Router, public toggleService: ToggleService) {}

  ngOnInit() {
    this.bpo.observe([Breakpoints.Handset])
      .subscribe(state => this.isHandset = state.matches);
  }

}