import { Injectable, inject, signal } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { from } from 'rxjs';
import { user } from 'rxfire/auth';
import { UserInterface } from './user.interface';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isAuthenticated = false;
  firebaseAuth = inject(Auth);
  constructor(private router: Router) {}
  user$ = user(this.firebaseAuth);
  currentUserSig = signal<UserInterface | null | undefined>(undefined);
  login(email: string, password: string): Observable<void> {
    const promise = signInWithEmailAndPassword(
      this.firebaseAuth,
      email,
      password
    ).then(() => {
      this.isAuthenticated = true;
      this.router.navigate(['/dashboard']);
    });
    return from(promise);
  }

  signup(username: string, email: string, password: string): Observable<void> {
    const promise = createUserWithEmailAndPassword(
      this.firebaseAuth,
      email,
      password
    ).then((userCredential) => {
      updateProfile(userCredential.user, { displayName: username });
    });
    return from(promise);
  }

  logout(): void {
    this.isAuthenticated = false;
    this.router.navigate(['/login']);
  }
  getAuthStatus(): boolean {
    return this.isAuthenticated;
  }
}
