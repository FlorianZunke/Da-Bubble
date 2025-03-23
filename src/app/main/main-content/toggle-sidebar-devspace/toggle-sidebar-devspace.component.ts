import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toggle-sidebar-devspace',
  imports: [CommonModule],
  templateUrl: './toggle-sidebar-devspace.component.html',
  styleUrl: './toggle-sidebar-devspace.component.scss'
})
export class ToggleSidebarDevspaceComponent {
  
  
toggleSidebarDevspace() {
  const elementClose = document.getElementById('close-sidebar-devspace');
    if (elementClose) {
      elementClose.classList.toggle('d-none');
    }
    const elementOpen = document.getElementById('open-sidebar-devspace');
    if (elementOpen) {
      elementOpen.classList.toggle('d-none');
    }
  }
}