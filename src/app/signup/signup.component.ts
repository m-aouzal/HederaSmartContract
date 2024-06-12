import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-register',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class SignUpComponent {
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  router = inject(Router);
  authService = inject(AuthService);
  form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });
  errorMessage: string | null = null;
  authFailed: boolean = false;

  onSubmit(): void {
    const rowForm = this.form.getRawValue();
    this.authService
      .signup(rowForm.username, rowForm.email, rowForm.password)
      .subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: (err) => {
          this.errorMessage = err.message;
          this.authFailed = true;
        },
      });
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  onHandleError(): void {
    this.errorMessage = null;
    this.authFailed = false;
  }
}
