// src/app/features/sign-in/sign-in.component.ts
import { Component, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { Data, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, NgModel } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
} from 'firebase/auth';

import { LogService } from '../../firebase-services/log.service';
import { MessageService } from '../../firebase-services/message.service';
import { User } from '../../models/user.class';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { DataService } from '../../firebase-services/data.service';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    RouterModule,
    MatTooltipModule,
  ],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
})
export class SignInComponent implements OnInit {
  /* ───────────────────────── Snackbar ───────────────────────── */
  private _snackBar = inject(MatSnackBar);
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  openSnackBar() {
    this._snackBar.open(
      'Login fehlgeschlagen. Bitte Email und Passwort erneut eingeben',
      'Nochmal probieren',
      {
        horizontalPosition: this.horizontalPosition,
        verticalPosition: this.verticalPosition,
      }
    );
  }
  closeSnackBar() {
    this._snackBar.dismiss();
  }

  /* ───────────────────────── Splash / Intro ─────────────────── */
  showSplash = false; // Standard: ausgeblendet
  private readonly splashDurationMs = 5_000; // wie lange sichtbar
  private readonly cooldownMs = 20_000; // 1-Min-Cool-down

  /* ───────────────────────── Formularmodell ─────────────────── */
  logInUser = { email: '', password: '' };

  private users: any[] = [];
  private logedUser: any = null;

  constructor(
    private logService: LogService,
    private userService: MessageService,
    private router: Router,
    private dataService: DataService
  ) {}

  /* ───────────────────────── Lifecycle ──────────────────────── */
  ngOnInit(): void {


    /*Animation wir nur beim ersten Auftruf ausgeführt*/
    const isLoaded = sessionStorage.getItem('loaded');

    if (isLoaded === 'true') {
      // ✅ Seite wurde schon einmal geladen – nichts tun
    } else {
      // 🔄 Seite wird zum ersten Mal geladen oder wurde zurückgesetzt
      
      /* Cool-down-Logik für Splash */
    const last = Number(localStorage.getItem('lastSplashTs') ?? 0);
    const now = Date.now();

    if (now - last > this.cooldownMs) {
      this.showSplash = true;
      localStorage.setItem('lastSplashTs', now.toString());

      setTimeout(() => (this.showSplash = false), this.splashDurationMs);
    }
      // und speichern nicht vergessen
      sessionStorage.setItem('loaded', 'true');
    }
  }

  /* ───────────────────────── E-Mail-Login ───────────────────── */
  async login(): Promise<void> {
    const auth = getAuth();
    try {
      await signInWithEmailAndPassword(
        auth,
        this.logInUser.email,
        this.logInUser.password
      );
      await this.loadLoggedUser(this.logInUser.email);
      await this.handlePostLogin();
    } catch (err) {
      this.openSnackBar();
      this.logInUser.email = '';
      this.logInUser.password = '';
      setTimeout(() => this.closeSnackBar(), 5_000);
    }
  }

  /* ───────────────────────── Google-Login ───────────────────── */
  async loginWithGoogle(): Promise<void> {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      const cred = await signInWithPopup(auth, provider);
      const fbUser = cred.user;

      await this.ensureUserDoc(fbUser);
      await this.loadLoggedUser(fbUser.email ?? '');
      await this.handlePostLogin();
    } catch (err) {
      console.error('Google-Login fehlgeschlagen:', err);
    }
  }

  /* ───────────────────────── Gast-Login ─────────────────────── */
  async guestLogin(): Promise<void> {
    this.logInUser.email = 'gast@dabubble.de';
    this.logInUser.password = 'Testuser1!';
    await this.login();
  }

  /* ───────────────────────── Hilfs-Funktionen ───────────────── */
  private async loadLoggedUser(email: string): Promise<void> {
    this.users = await this.userService.getAllUsers();
    this.logedUser = this.users.find(
      (u) => u?.email?.toLowerCase() === email.toLowerCase()
    );
  }

  private async ensureUserDoc(fbUser: FirebaseUser): Promise<void> {
    const all = await this.userService.getAllUsers();
    const exists = all.some((u) => u.fireId === fbUser.uid);
    if (exists) return;

    const newUser = new User();
    newUser.fireId = fbUser.uid;
    newUser.email = fbUser.email ?? '';
    newUser.name = fbUser.displayName ?? '';
    newUser.picture = fbUser.photoURL ?? '';
    newUser.online = true;
    newUser.id = Math.floor(100000 + Math.random() * 900000);

    await this.userService.addNewUserFromGoogle(newUser);
  }

  private async handlePostLogin(): Promise<void> {
    if (!this.logedUser) return;

    this.dataService.setLoggedUser(this.logedUser);

    /* Online-Status */
    this.logedUser.online = true;
    await this.logService.updateOnlineStatus(this.logedUser.fireId, true);

    /* SessionStorage */
    sessionStorage.setItem('user', JSON.stringify(this.logedUser));

    /* Weiter in die App */
    this.router.navigate(['main']);
  }

  /* ───────────────────────── Fehlermeldungen ────────────────── */
  getEmailErrorMessage(emailInput: NgModel): string {
    if (emailInput.errors?.['required'])
      return 'Bitte gib eine E-Mail-Adresse ein';
    if (emailInput.errors?.['pattern'])
      return 'Bitte gib eine gültige E-Mail-Adresse ein';
    return ' ';
  }
  getPasswordErrorMessage(passwordInput: NgModel): string {
    if (passwordInput.errors?.['required'])
      return 'Bitte gib dein Passwort ein';
    return ' ';
  }
}
