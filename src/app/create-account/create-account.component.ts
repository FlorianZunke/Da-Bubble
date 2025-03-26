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
} from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';
import { LogService } from '../firebase-services/log.service';
import { User } from '../models/user.class';
import { Router } from '@angular/router';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

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

  async onSubmit() {
    let userId: number = this.getID();
    let newUser: User = {
      id: userId,
      name: this.newUser.name,
      email: this.newUser.email,
      password: this.newUser.password,
      picture: 'img2/avatars/avatar_anonym.svg',
      online: true,
      status: true,
    };
    await this.firebaseSignUp.addUser(newUser);
    const auth = getAuth();
    createUserWithEmailAndPassword(
      auth,
      this.newUser.email,
      this.newUser.password
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
}
