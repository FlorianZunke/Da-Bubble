import { Routes } from '@angular/router';
import { CreateAccountComponent } from './create-account/create-account.component';
import { ChooseAvatarComponent } from './choose-avatar/choose-avatar.component';
import { MainContentComponent } from './main/main-content/main-content.component';
import { LegalNoticeComponent } from './legal-notice/legal-notice.component';
import { SignInComponent } from './features/sign-in/sign-in.component';
import { ImpressumComponent } from './features/impressum/impressum.component';
import { DatenschutzComponent } from './features/datenschutz/datenschutz.component';
import { ResetPasswordComponent } from './features/reset-password/reset-password.component';
import { SetNewPasswordComponent } from './features/set-new-password/set-new-password.component';

export const routes: Routes = [
  { path: '', component: SignInComponent },
  { path: 'main', component: MainContentComponent },
  { path: 'sign-in', component: CreateAccountComponent },
  { path: 'choose-avatar', component: ChooseAvatarComponent },
  { path: 'login', component: SignInComponent },
  { path: 'legalNotice', component: LegalNoticeComponent },
  { path: 'Ímpressum', component: ImpressumComponent },
  { path: 'Datenschutz', component: DatenschutzComponent },
  { path: 'ResetPW', component: ResetPasswordComponent },
  { path: 'NewPW', component: SetNewPasswordComponent },
];
