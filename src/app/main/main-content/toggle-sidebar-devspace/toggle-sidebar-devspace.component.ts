import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from './../../../firebase-services/data.service';

@Component({
  selector: 'app-toggle-sidebar-devspace',
  imports: [CommonModule],
  templateUrl: './toggle-sidebar-devspace.component.html',
  styleUrl: './toggle-sidebar-devspace.component.scss'
})
export class ToggleSidebarDevspaceComponent {
 
   constructor(
      public dataService: DataService,
   ) {}
}