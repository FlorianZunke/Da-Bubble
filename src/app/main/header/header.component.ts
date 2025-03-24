import { Component } from '@angular/core';
import { LogoAndSearchbarComponent } from './logo-and-searchbar/logo-and-searchbar.component';
import { SignedInUserComponent } from './signed-in-user/signed-in-user.component';

@Component({
  selector: 'app-header',
  imports: [LogoAndSearchbarComponent, SignedInUserComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

}
