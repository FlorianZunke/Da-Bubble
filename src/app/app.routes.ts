import { Routes, RouterOutlet } from '@angular/router';
import { CreateAccountComponent } from './create-account/create-account.component';
import { LogInComponent } from './log-in/log-in.component';
import { ChooseAvatarComponent } from './choose-avatar/choose-avatar.component';
import { TestLoginComponent } from './test-login/test-login.component';
import { MainContentComponent } from './main/main-content/main-content.component';

export const routes: Routes = [
  {path: '', component: LogInComponent},
  {path: 'main', component: MainContentComponent},
  {path: 'sign-in', component: CreateAccountComponent},
  {path: 'choose-avatar', component: ChooseAvatarComponent},
  {path: 'testLogin', component: TestLoginComponent},
];
