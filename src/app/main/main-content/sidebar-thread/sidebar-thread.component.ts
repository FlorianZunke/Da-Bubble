import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { DataService } from './../../../firebase-services/data.service';
import { TextareaComponent } from '../message-box/textarea/textarea.component';

@Component({
  selector: 'app-sidebar-thread',
  imports: [CommonModule, TextareaComponent],
  templateUrl: './sidebar-thread.component.html',
  styleUrl: './sidebar-thread.component.scss'
})
export class SidebarThreadComponent {
  dataService = inject(DataService);

  closeThreadDialog() {
    this.dataService.sidebarThreadIsVisible = false;
  }
}