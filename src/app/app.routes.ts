import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SignUpComponent } from './signup/signup.component';
import { AuthGuard } from './services/auth.guard';
import { LoginGuard } from './services/login.guard';
import { AdminComponent } from './admin/admin.component';
import { AdminGuard } from './services/admin.guard';
export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
  //{ path: 'signup', component: SignUpComponent, canActivate: [LoginGuard] },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  { path: 'admin', component: AdminComponent, canActivate: [AdminGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];

