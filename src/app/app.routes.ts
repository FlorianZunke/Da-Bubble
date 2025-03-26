import { Routes } from '@angular/router';
import { SignInComponent } from './features/sign-in/sign-in.component';

export const routes: Routes = [
  { path: '', redirectTo: 'signin', pathMatch: 'full' },

  { path: 'signin', component: SignInComponent },

  { path: '**', redirectTo: 'signin' },
];
