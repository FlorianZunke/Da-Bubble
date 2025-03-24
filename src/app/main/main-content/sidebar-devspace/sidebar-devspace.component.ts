import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from './../../../firebase-services/data.service';

@Component({
  selector: 'app-sidebar-devspace',
  imports: [CommonModule],
  templateUrl: './sidebar-devspace.component.html',
  styleUrl: './sidebar-devspace.component.scss'
})
export class SidebarDevspaceComponent {
  dataService = inject(DataService);

  user = [
    {
      "name": "Frederik Beck",
      "picture": "img\\avatar\\avatar1"
    },
    {
      "name": "Sofia Müller",
      "picture": "img\\avatar\\avatar2"
    },
    {
      "name": "Noah Braun",
      "picture": "img\\avatar\\avatar3"
    },
    {
      "name": "Elise Roth",
      "picture": "img\\avatar\\avatar4"
    },
    {
      "name": "Elias Neuman",
      "picture": "img\\avatar\\avatar5"
    },
    {
      "name": "Steffen Hoffmann",
      "picture": "img\\avatar\\avatar6"
    }
  ]
}
