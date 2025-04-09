import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import {
  FormsModule,
  FormControl,
  FormGroupDirective,
  NgForm,
  Validators,
  ReactiveFormsModule,
  NgModel,
} from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';
import { LogService } from '../firebase-services/log.service';
import { User } from '../models/user.class';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-account',
  imports: [
    MatCardModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    RouterLink,
    RouterLinkActive,
    CommonModule
  ],
  templateUrl: './create-account.component.html',
  styleUrl: './create-account.component.scss',
})
export class CreateAccountComponent {
  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);

  constructor(private firebaseSignUp: LogService, private router: Router) {}

  newUser = new User();
  savedUser = new User();
  accepted = false;
  password: string = '';

  async onSubmit() {
    let userId: number = this.getID();
    let newUser: User = {
      id: userId,
      name: this.newUser.name,
      email: this.newUser.email,
      fireId: 'hier steht die FireID',
      picture: 'img2/avatars/avatar_anonym.svg',
      online: true,
      status: true,
    };
    let password: string = this.password;
    await this.firebaseSignUp.addUser(newUser,password);
    const auth = getAuth();
    createUserWithEmailAndPassword(
      auth,
      this.newUser.email,
      password
    )
      .then((userCredential) => {
        // Signed up
        const user = userCredential.user;
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // ..
      });
    this.newUser = new User();
    this.router.navigate(['/choose-avatar']);
  }

  getID() {
    return Math.floor(100000 + Math.random() * 900000);
    //hier müssen die IDs aller bestehenden User abgegelichen werden
    //wenn id vorhandne ist muss ein neue generiert werden
  }

  goBack() {
    this.router.navigate(['testLogin']);
  }

  openInNewTab(route: string) {
    const url = this.router.serializeUrl(this.router.createUrlTree([route]));
    window.open(url, '_blank');
  }

  getPasswordErrorMessage(passwordInput: NgModel): string {
    if (passwordInput.errors?.['required']) {
      return "Bitte geben Sie ein Passwort ein";
    }
    if (passwordInput.errors?.['pattern']) {
      return "Mind. 8 Zeichen mit Groß- und Kleinbuchstaben, Sonderzeichen und Ziffern";
    }
    return " ";
  }

  getEmailErrorMessage(emailInput: NgModel): string {
    if (emailInput.errors?.['required']) {
      return "Bitte geben Sie eine E-Mail-Adresse ein";
    }
    if (emailInput.errors?.['pattern']) {
      return "Bitte geben Sie eine gültige E-Mail-Adresse ein";
    }
    return " ";
  }

  getNameErrorMessage(nameInput: NgModel): string {
    if (nameInput.errors?.['required']) {
      return "Bitte schreiben Sie einen Namen";
    }
    return " ";
  }
}
