import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, NgModel, FormControl } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { LogService } from '../firebase-services/log.service';

@Component({
  selector: 'app-test-login',
  imports: [MatFormFieldModule, CommonModule, FormsModule, MatInputModule],
  templateUrl: './test-login.component.html',
  styleUrl: './test-login.component.scss',
})
export class TestLoginComponent {
  logInUser = {
    email: '',
    password: '',
  };

  constructor(private firebaseSignUp: LogService) {}

  async login() {
    let logInUser = {
      email: this.logInUser.email,
      password: this.logInUser.password,
    };
    console.log(logInUser);
    const auth = getAuth();
    signInWithEmailAndPassword(auth, logInUser.email, logInUser.password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        // ...
        console.log('User wurde erfolgreich eingeloggt');
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
      });
  }
}
