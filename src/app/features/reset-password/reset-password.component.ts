import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatCardModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ResetPasswordComponent implements OnInit {
  resetForm!: FormGroup;
  submitted = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
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

  onSubmit() {
    this.submitted = true;
    if (this.resetForm.valid) {
      console.log('Sending reset email to', this.resetForm.value.email);
      // Hier den Reset-E-Mail-Versand implementieren
    } else {
      console.log('Invalid email address');
    }
  }
}
