import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { take, map } from 'rxjs/operators';

export const AdminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.user$.pipe(
    take(1),
    map((user) => {
      if (user && authService.isAdmin()) {
        return true;
      } else {
        return router.createUrlTree(['/dashboard']);
      }
    })
  );
};
