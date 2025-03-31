import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterModule, Router } from '@angular/router';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { LogService } from '../../firebase-services/log.service';

@Component({
  selector: 'app-sign-in',
  standalone: true,
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
  ],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SignInComponent implements OnInit {
  showSplash = true;
  logInUser = {
    email: '',
    password: '',
  };

  constructor(private firebaseSignUp: LogService, private router: Router) {}

  ngOnInit() {
    setTimeout(() => {
      this.showSplash = false;
      console.log('Splash hidden?', this.showSplash);
    }, 5000);
  }

  testClick() {
    console.log('Button was clicked!');
  }

  async login() {
    const auth = getAuth();
    signInWithEmailAndPassword(
      auth,
      this.logInUser.email,
      this.logInUser.password
    )
      .then((userCredential) => {
        console.log('User wurde erfolgreich eingeloggt');
        this.router.navigate(['/main']);
      })
      .catch((error) => {
        console.error('Login error:', error);
      });
  }
}
