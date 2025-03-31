import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-datenschutz',
  standalone: true,
  imports: [CommonModule, MatCardModule, RouterModule],
  templateUrl: './datenschutz.component.html',
  styleUrls: ['./datenschutz.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DatenschutzComponent implements OnInit {
  ngOnInit(): void {
    // Deine Logik, falls erforderlich
  }
}
