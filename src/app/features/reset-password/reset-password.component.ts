import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import {
  getAuth,
  sendPasswordResetEmail,
  confirmPasswordReset,
} from 'firebase/auth';
import { getApps, initializeApp } from 'firebase/app';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatCardModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ResetPasswordComponent implements OnInit {
  // email & passwort eingeben
  resetStage: number = 1;
  resetForm!: FormGroup;
  newPassForm!: FormGroup;
  oobCode: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // prüft ob der reset code in der url vorhanden ist
    this.oobCode = this.route.snapshot.queryParamMap.get('oobCode');
    if (this.oobCode) {
      this.resetStage = 2;
      this.initNewPassForm();
    } else {
      this.initResetForm();
    }
  }

  // Initialisiert das Formular für das Senden der Reset-E-Mail
  initResetForm(): void {
    this.resetForm = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[^@]+@[^@]+\.[A-Za-z]{2,}$/),
        ],
      ],
    });
  }

  // Initialisiert das Formular für das Setzen eines neuen Passworts
  initNewPassForm(): void {
    this.newPassForm = this.fb.group(
      {
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  // Validator: Prüft, ob die beiden Passworteingaben übereinstimmen
  passwordMatchValidator(form: FormGroup) {
    return form.get('newPassword')?.value === form.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  // Sendet die Reset-Mail
  onSubmitReset(): void {
    if (this.resetForm.valid) {
      // Prüfen, ob Firebase initialisiert ist
      if (!getApps().length) {
        initializeApp(environment.firebaseConfig);
      }
      const auth = getAuth();
      const email = this.resetForm.value.email;
      sendPasswordResetEmail(auth, email)
        .then(() => {
          console.log('Reset email sent successfully.');
          alert('Eine E-Mail zum Zurücksetzen Ihres Passworts wurde gesendet.');
        })
        .catch((error) => {
          console.error('Error sending reset email:', error);
          alert(
            'Fehler beim Senden der E-Mail. Bitte überprüfen Sie Ihre Eingabe.'
          );
        });
    } else {
      console.log('Invalid email address.');
    }
  }

  // Bestätigen und Setzen vom neuen Passwort
  onSubmitNewPass(): void {
    if (this.newPassForm.valid && this.oobCode) {
      const newPassword = this.newPassForm.value.newPassword;
      // Sicherstellen, dass eine Firebase-App initialisiert ist
      if (!getApps().length) {
        initializeApp(environment.firebaseConfig);
      }
      const auth = getAuth();
      confirmPasswordReset(auth, this.oobCode, newPassword)
        .then(() => {
          console.log('Password has been reset successfully.');
          alert('Ihr Passwort wurde erfolgreich geändert.');
          this.router.navigate(['/login']);
        })
        .catch((error) => {
          console.error('Error resetting password:', error);
          alert('Fehler beim Zurücksetzen des Passworts.');
        });
    }
  }
}
