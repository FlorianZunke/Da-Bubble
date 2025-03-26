import { Routes } from '@angular/router';
import { SignInComponent } from './features/sign-in/sign-in.component';

export const routes: Routes = [
  // Leitet direkt auf /signin
  { path: '', redirectTo: 'signin', pathMatch: 'full' },

  // Nur SignInComponent
  { path: 'signin', component: SignInComponent },

  // Fallback
  { path: '**', redirectTo: 'signin' },
];
