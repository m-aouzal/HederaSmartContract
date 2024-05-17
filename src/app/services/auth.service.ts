import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = false;

  constructor(private router: Router) {}

  login(email: string, password: string): boolean {
    if (email === 'user@example.com' && password === 'password') {
      this.isAuthenticated = true;
      this.router.navigate(['/dashboard']);
      return true;
    } else {
      return false;
    }
  }

  logout() {
    this.isAuthenticated = false;
    this.router.navigate(['/login']);
  }

  getAuthStatus(): boolean {
    return this.isAuthenticated;
  }
}
