import { Injectable, inject, signal } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  User,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable, from } from 'rxjs';
import { user } from 'rxfire/auth';
import { UserInterface } from './user.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isAuthenticated = false;
  firebaseAuth = inject(Auth);
  currentUserSig = signal<UserInterface | null>(null);

  constructor(private router: Router) {
    this.firebaseAuth.onAuthStateChanged((user) => {
      if (user) {
        this.currentUserSig.set({
          email: user.email!,
          username: user.displayName ?? '',
        });
        this.isAuthenticated = true;
      } else {
        this.currentUserSig.set(null);
        this.isAuthenticated = false;
      }
    });
  }

  user$ = user(this.firebaseAuth);

  login(email: string, password: string): Observable<void> {
    const promise = signInWithEmailAndPassword(
      this.firebaseAuth,
      email,
      password
    ).then((userCredential) => {
      this.isAuthenticated = true;
      this.currentUserSig.set({
        email: userCredential.user.email!,
        username: userCredential.user.displayName ?? '',
      });
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
      return updateProfile(userCredential.user, { displayName: username }).then(
        () => {
          this.currentUserSig.set({
            email: userCredential.user.email!,
            username: username,
          });
        }
      );
    });
    return from(promise);
  }

  logout(): Observable<void> {
    const promise = this.firebaseAuth.signOut().then(() => {
      this.isAuthenticated = false;
      this.currentUserSig.set(null);
      this.router.navigate(['/login']);
    });
    return from(promise);
  }

  getAuthStatus(): boolean {
    return this.isAuthenticated;
  }

  isAdmin(): boolean {
    const currentUser = this.currentUserSig();
    return currentUser ? currentUser.email === 'aouzal1999@gmail.com' : false;
  }
}
