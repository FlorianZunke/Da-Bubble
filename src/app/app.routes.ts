import { Routes } from '@angular/router';

import { SignInComponent } from './features/sign-in/sign-in.component';
import { CreateAccountComponent } from './create-account/create-account.component';
import { ChooseAvatarComponent } from './choose-avatar/choose-avatar.component';
import { MainContentComponent } from './main/main-content/main-content.component';

import { ChannelMessageComponent } from './main/main-content/message-box/channel-message/channel-message.component';
import { DirectMessageComponent } from './main/main-content/message-box/direct-message/direct-message.component';
import { NewMessageComponent } from './main/main-content/message-box/new-message/new-message.component';
import { ImpressumComponent } from './features/impressum/impressum.component';
import { DatenschutzComponent } from './features/datenschutz/datenschutz.component';
import { ResetPasswordComponent } from './features/reset-password/reset-password.component';
import { SetNewPasswordComponent } from './features/set-new-password/set-new-password.component';
import { SidebarDevspaceComponent } from './main/main-content/sidebar-devspace/sidebar-devspace.component';

export const routes: Routes = [
  /* ---------- Public / Auth ---------- */
  { path: '', component: SignInComponent }, // default
  { path: 'login', component: SignInComponent },
  { path: 'register', component: CreateAccountComponent },
  { path: 'choose-avatar', component: ChooseAvatarComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'new-password', component: SetNewPasswordComponent },

  /* ---------- Legal ---------- */
  { path: 'impressum', component: ImpressumComponent },
  { path: 'datenschutz', component: DatenschutzComponent },

  /* ---------- Haupt-App ---------- */
  { path: 'main', component: MainContentComponent },
  { path: 'dev-space', component: SidebarDevspaceComponent },
  { path: 'channel', component: ChannelMessageComponent },
  { path: 'direct', component: DirectMessageComponent },
  { path: 'new-message', component: NewMessageComponent },

  /* ---------- Fallback ---------- */
  { path: '**', redirectTo: '' },
];
