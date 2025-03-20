import { Component } from '@angular/core';
import { LogoComponent } from './logo/logo.component';
import { SearchbarComponent } from './searchbar/searchbar.component';
import { SignedInUserComponent } from './signed-in-user/signed-in-user.component';

@Component({
  selector: 'app-header',
  imports: [LogoComponent, SearchbarComponent, SignedInUserComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

}
