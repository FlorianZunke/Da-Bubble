import { Component } from '@angular/core';
import { HeaderComponent } from './main/header/header.component';
import { MainContentComponent } from './main/main-content/main-content.component';
// mport { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, MainContentComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'DA-Bubble';
}
