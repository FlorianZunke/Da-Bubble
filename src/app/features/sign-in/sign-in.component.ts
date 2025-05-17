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
    MatTooltipModule
  ],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
})
export class SignInComponent implements OnInit {

  private _snackBar = inject(MatSnackBar);
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  openSnackBar() {
    this._snackBar.open('Login fehlgeschlagen. Bitte Email und Passwort erneut eingeben', 'Nochmal probieren', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }

  closeSnackBar() {
    this._snackBar.dismiss();
  }

  /** Splash */
  showSplash = true;

  /** Form model */
  logInUser = {
    email: '',
    password: '',
  };

  private users: any[] = [];
  private logedUser: any = null;

  constructor(
    private logService: LogService,
    private userService: MessageService,
    private router: Router,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    setTimeout(() => (this.showSplash = false), 5000);
  }

  /** E-Mail / Passwort Login */
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
      // console.error('E-Mail-Login fehlgeschlagen:', err);
      this.openSnackBar();
      this.logInUser.email = '';
      this.logInUser.password = '';
      setTimeout(() => {
        this.closeSnackBar();
      }, 5000);

    }
  }

  /** Google-Login */
  async loginWithGoogle(): Promise<void> {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      const cred = await signInWithPopup(auth, provider);
      const fbUser: FirebaseUser = cred.user;

      // sicherstellen, dass es einen Firestore-Eintrag gibt
      await this.ensureUserDoc(fbUser);

      // anschließend den eingeloggten Nutzer holen und weiter
      await this.loadLoggedUser(fbUser.email ?? '');
      await this.handlePostLogin();
    } catch (err) {
      console.error('Google-Login fehlgeschlagen:', err);
    }
  }

  /** Gäste-Login – setzt Demo-Daten und loggt direkt ein */
  async guestLogin(): Promise<void> {
    this.logInUser.email = 'gast@dabubble.de';
    this.logInUser.password = 'Testuser1!';
    await this.login();
  }

  /** lädt alle Nutzer und sucht den gerade eingeloggten */
  private async loadLoggedUser(email: string): Promise<void> {
    this.users = await this.userService.getAllUsers();
    this.logedUser = this.users.find(
      (u) => u?.email?.toLowerCase() === email.toLowerCase()
    );
  }

  /**
   * Legt bei erstmaligem Google-Anmelden ein neues User-Dokument an
   */
  private async ensureUserDoc(fbUser: FirebaseUser): Promise<void> {
    const all = await this.userService.getAllUsers();
    const exists = all.some((u) => u.fireId === fbUser.uid);
    if (!exists) {
      // Mappe FirebaseUser → dein User-Klasse-Modell
      const newUser = new User();
      newUser.fireId = fbUser.uid;
      newUser.email = fbUser.email ?? '';
      newUser.name = fbUser.displayName ?? '';
      newUser.picture = fbUser.photoURL ?? '';
      newUser.online = true;
      newUser.id = Math.floor(100000 + Math.random() * 900000);
      // status entfernt, da boolean

      await this.userService.addNewUserFromGoogle(newUser);
    }
  }

  /** setzt Online-Status, SessionStorage und navigiert */
  private async handlePostLogin(): Promise<void> {
    if (!this.logedUser) {
      console.warn('Kein User-Datensatz gefunden, Abbruch.');
      return;
    }

    this.dataService.setLoggedUser(this.logedUser);

    // Online-Status aktualisieren
    this.logedUser.online = true;
    await this.logService.updateOnlineStatus(this.logedUser.fireId, true);

    // in Session speichern
    sessionStorage.setItem('user', JSON.stringify(this.logedUser));

    // in die App weiter
    this.router.navigate(['main']);
  }

  getEmailErrorMessage(emailInput: NgModel): string {
    if (emailInput.errors?.['required']) {
      return "Bitte gib eine E-Mail-Adresse ein";
    }
    if (emailInput.errors?.['pattern']) {
      return "Bitte gib eine gültige E-Mail-Adresse ein";
    }
    return " ";
  }

  getPasswordErrorMessage(passwordInput: NgModel): string {
    if (passwordInput.errors?.['required']) {
      return "Bitte gib dein Passwort ein";
    }
    return " ";
  }
}
