import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-impressum',
  standalone: true,
  imports: [CommonModule, MatCardModule, RouterModule],
  templateUrl: './impressum.component.html',
  styleUrls: ['./impressum.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ImpressumComponent implements OnInit {
  ngOnInit(): void {
    // Deine Logik
  }
}
