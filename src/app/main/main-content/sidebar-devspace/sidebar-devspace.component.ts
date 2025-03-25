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

  channel:string[] = ['Entwicklerteam','Office-Team'];
  users = [
    {
      "name": "Frederik Beck (Du)",
      "picture": "avatar1"
    },
    {
      "name": "Sofia Müller",
      "picture": "avatar2"
    },
    {
      "name": "Noah Braun",
      "picture": "avatar3"
    },
    {
      "name": "Elise Roth",
      "picture": "avatar4"
    },
    {
      "name": "Elias Neuman",
      "picture": "avatar5"
    },
    {
      "name": "Steffen Hoffmann",
      "picture": "avatar6"
    }
  ]

  toggleChannel() {
    const toggleChannel = document.getElementById('channel');
    if (toggleChannel) {
      toggleChannel.classList.toggle('d-none');
    }
  }

  toggleUserChannel() {
    const toggleUserChannel = document.getElementById('user-channel');
    if (toggleUserChannel) {
      toggleUserChannel.classList.toggle('d-none');
    }
  }
}
