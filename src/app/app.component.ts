import { Component,inject } from   '@angular/core';
import { RouterOutlet } from '@angular/router';
import {LoginComponent} from "./login/login.component";
import { AuthService } from './services/auth.service';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoginComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'SmartContract';
  authServices = inject(AuthService);

  ngOnInit() {
    this.authServices.user$.subscribe((user) => {
      if (user) {
        this.authServices.currentUserSig.set({
          username: user.displayName!,
          email : user.email!
        });

      } else {
        this.authServices.currentUserSig.set(null);
      }
    })
  }
 
}
