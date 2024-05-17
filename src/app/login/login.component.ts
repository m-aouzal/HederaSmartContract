import { Component } from '@angular/core';
import {AuthService} from "../services/auth.service";
import {FormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService) {}

  loginWithDummyAuth() {
    const success = this.authService.login(this.email, this.password);
    if (!success) {
      this.errorMessage = 'Invalid email or password';
    }
  }
}
