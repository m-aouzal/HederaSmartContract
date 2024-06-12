import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class LoginComponent {
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  router = inject(Router);
  authService = inject(AuthService);
  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  errorMessage: string | null = null;
  authFailed: boolean = false;

  onSubmit(): void {
    const rowForm = this.form.getRawValue();
    this.authService.login(rowForm.email, rowForm.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.errorMessage = err.message;
        this.authFailed = true;
      },
    });
  }

  navigateToSignUp(): void {
    this.router.navigate(['/signup']);
  }

  onHandleError(): void {
    this.errorMessage = null;
    this.authFailed = false;
  }
}
