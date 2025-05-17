import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToggleSidebarDevspaceComponent } from './toggle-sidebar-devspace/toggle-sidebar-devspace.component';
import { SidebarDevspaceComponent } from './sidebar-devspace/sidebar-devspace.component';
import { NewMessageComponent } from './message-box/new-message/new-message.component';
import { DirectMessageComponent } from './message-box/direct-message/direct-message.component';
import { ChannelMessageComponent } from './message-box/channel-message/channel-message.component';
import { SidebarThreadComponent } from './sidebar-thread/sidebar-thread.component';
import { HeaderComponent } from '../header/header.component';
import { DataService } from './../../firebase-services/data.service';
import { ToggleService } from '../../firebase-services/toogle.service';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { LayoutModule } from '@angular/cdk/layout'; 

@Component({
  selector: 'app-main-content',
  imports: [CommonModule, ToggleSidebarDevspaceComponent, SidebarDevspaceComponent, NewMessageComponent, DirectMessageComponent, ChannelMessageComponent, SidebarThreadComponent, HeaderComponent, LayoutModule],
  templateUrl: './main-content.component.html',
  styleUrl: './main-content.component.scss'
})

export class MainContentComponent {
  dataService = inject(DataService);

  CUSTOM_BREAKPOINTS = {
    isMobilePortrait: '(max-width: 799px) and (orientation: portrait)',
    isMobileLandscape: '(max-width: 799px) and (orientation: landscape)',

    isTabletPortrait: '(min-width: 800px) and (max-width: 1023px) and (orientation: portrait)',
    isTabletLandscape: '(min-width: 960px) and (max-width: 1279px) and (orientation: landscape)',
    isWeb: '(max-width: 1024px) and (orientation: landscape)'
  };
  
  constructor( 
    private bpo: BreakpointObserver, 
    public toggleService: ToggleService
    ) {}

ngOnInit() {
  this.bpo.observe([
    
    this.CUSTOM_BREAKPOINTS.isMobilePortrait,
    this.CUSTOM_BREAKPOINTS.isMobileLandscape,
    this.CUSTOM_BREAKPOINTS.isTabletPortrait,
    this.CUSTOM_BREAKPOINTS.isTabletLandscape,
    this.CUSTOM_BREAKPOINTS.isWeb

  ]).subscribe((result: BreakpointState) => {
    const isMobilePortrait = result.breakpoints[this.CUSTOM_BREAKPOINTS.isMobilePortrait];
    const isMobileLandscape = result.breakpoints[this.CUSTOM_BREAKPOINTS.isMobileLandscape];
    const isTabletPortrait = result.breakpoints[this.CUSTOM_BREAKPOINTS.isTabletPortrait];
    const isTabletLandscape = result.breakpoints[this.CUSTOM_BREAKPOINTS.isTabletLandscape];
    const isWeb = result.breakpoints[this.CUSTOM_BREAKPOINTS.isWeb];

    if (isMobilePortrait) {
      this.toggleService.isMobile = true;
      this.toggleService.showSidebar();
    } else if (isMobileLandscape) {
      this.toggleService.isMobile = true;
    } else if (isTabletPortrait) {
      this.toggleService.isMobileNewMessage = false;
      this.toggleService.isMobilSelectUser = false;
      this.toggleService.isMobileChannel = false;
      this.toggleService.isMobile = false;
    } else if (isTabletLandscape) {
      this.toggleService.isMobileNewMessage = false;
      this.toggleService.isMobilSelectUser = false;
      this.toggleService.isMobileChannel = false;
      this.toggleService.isMobile = false;
    } else {
      this.toggleService.isMobileNewMessage = false;
      this.toggleService.isMobilSelectUser = false;
      this.toggleService.isMobileChannel = false;
      this.toggleService.isMobile = false;
      }
    });
  }
}