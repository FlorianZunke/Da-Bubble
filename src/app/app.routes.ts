import { Routes } from '@angular/router';
import { CreateAccountComponent } from './create-account/create-account.component';
import { LogInComponent } from './log-in/log-in.component';
import { ChooseAvatarComponent } from './choose-avatar/choose-avatar.component';
import { TestLoginComponent } from './test-login/test-login.component';
import { MainContentComponent } from './main/main-content/main-content.component';
import { LegalNoticeComponent } from './legal-notice/legal-notice.component';
import { SignInComponent } from './features/sign-in/sign-in.component';
import { ImpressumComponent } from './features/impressum/impressum.component';
import { DatenschutzComponent } from './features/datenschutz/datenschutz.component';

export const routes: Routes = [
  { path: 'main', component: MainContentComponent },
  { path: 'create-account', component: CreateAccountComponent },
  { path: 'choose-avatar', component: ChooseAvatarComponent },
  { path: 'test-login', component: TestLoginComponent },
  { path: 'login', component: SignInComponent },
  { path: 'legal-notice', component: LegalNoticeComponent },
  { path: 'impressum', component: ImpressumComponent },
  { path: 'datenschutz', component: DatenschutzComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
