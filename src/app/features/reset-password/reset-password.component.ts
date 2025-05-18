import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import {
  getAuth,
  sendPasswordResetEmail,
  confirmPasswordReset,
} from 'firebase/auth';
import { getApps, initializeApp } from 'firebase/app';
import { environment } from '../../../environment';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatCardModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ResetPasswordComponent implements OnInit {
  resetStage = 1;
  resetForm!: FormGroup;
  newPassForm!: FormGroup;
  oobCode: string | null = null;

  // for showing confirmation messages
  emailSent = false;
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if oobCode (reset token) is in URL
    this.oobCode = this.route.snapshot.queryParamMap.get('oobCode');
    if (this.oobCode) {
      this.resetStage = 2;
      this.initNewPassForm();
    } else {
      this.initResetForm();
    }
  }

  private initResetForm(): void {
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

  private initNewPassForm(): void {
    this.newPassForm = this.fb.group(
      {
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  private passwordMatchValidator(form: FormGroup) {
    return form.get('newPassword')?.value === form.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  onSubmitReset(): void {
    if (!this.resetForm.valid) return;

    if (!getApps().length) {
      initializeApp(environment.firebaseConfig);
    }
    const auth = getAuth();
    const email = this.resetForm.value.email;

    sendPasswordResetEmail(auth, email)
      .then(() => {
        this.emailSent = true;
        this.successMessage =
          'Eine E-Mail zum Zurücksetzen Ihres Passworts wurde gesendet.';
        this.resetForm.reset(); // ← hier leeren
        setTimeout(() => this.router.navigate(['/']), 3000);
      })
      .catch((error) => {
        console.error('Error sending reset email:', error);
        this.emailSent = true;
        this.successMessage =
          'Fehler beim Senden der E-Mail. Bitte erneut versuchen.';
        this.resetForm.reset(); // ← und auch hier
      });
  }

  onSubmitNewPass(): void {
    if (!this.newPassForm.valid || !this.oobCode) {
      return;
    }
    if (!getApps().length) {
      initializeApp(environment.firebaseConfig);
    }
    const auth = getAuth();
    const newPassword = this.newPassForm.value.newPassword;
    confirmPasswordReset(auth, this.oobCode, newPassword)
      .then(() => {
        this.emailSent = true;
        this.successMessage = 'Ihr Passwort wurde erfolgreich geändert.';
        setTimeout(() => this.router.navigate(['/login']), 4000);
      })
      .catch((error) => {
        console.error('Error resetting password:', error);
        this.emailSent = true;
        this.successMessage = 'Fehler beim Zurücksetzen des Passworts.';
      });
  }
}
