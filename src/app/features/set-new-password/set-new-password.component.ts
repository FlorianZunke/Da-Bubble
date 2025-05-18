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
import { getAuth, confirmPasswordReset } from 'firebase/auth';
import { getApps, initializeApp } from 'firebase/app';
import { environment } from '../../../environment';

@Component({
  selector: 'app-set-new-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatCardModule],
  templateUrl: './set-new-password.component.html',
  styleUrls: ['./set-new-password.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SetNewPasswordComponent implements OnInit {
  newPassForm!: FormGroup;
  oobCode: string | null = null;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Holt den reset-code aus der url
    this.oobCode = this.route.snapshot.queryParamMap.get('oobCode');
    if (!this.oobCode) {
      alert('Kein gültiger Reset-Code vorhanden.');
      this.router.navigate(['/login']);
    } else {
      this.initNewPassForm();
    }
  }

  initNewPassForm(): void {
    //  mindestens 8 Zeichen, mindestens ein Großbuchstabe, mindestens ein Sonderzeichen
    this.newPassForm = this.fb.group(
      {
        newPassword: [
          '',
          [
            Validators.required,
            Validators.pattern(/^(?=.*[A-Z])(?=.*\W).{8,}$/),
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('newPassword')?.value === form.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  onSubmitNewPass(): void {
    this.submitted = true;
    if (this.newPassForm.valid && this.oobCode) {
      const newPassword = this.newPassForm.value.newPassword;
      if (!getApps().length) {
        initializeApp(environment.firebaseConfig);
      }
      const auth = getAuth();
      confirmPasswordReset(auth, this.oobCode, newPassword)
        .then(() => {
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
