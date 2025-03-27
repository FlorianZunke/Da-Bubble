import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { DataService } from './../../../firebase-services/data.service';

@Component({
  selector: 'app-sidebar-thread',
  imports: [CommonModule],
  templateUrl: './sidebar-thread.component.html',
  styleUrl: './sidebar-thread.component.scss'
})
export class SidebarThreadComponent {
  dataService = inject(DataService);
  
}
