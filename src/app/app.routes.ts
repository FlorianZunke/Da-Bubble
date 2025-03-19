import { Routes, RouterOutlet } from '@angular/router';
import { CreateAccountComponent } from './create-account/create-account.component';
import { LogInComponent } from './log-in/log-in.component';

export const routes: Routes = [
  {path: '', component: LogInComponent},
  {path: 'sign-in', component: CreateAccountComponent},
];
