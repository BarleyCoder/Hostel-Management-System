import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from './auth.service';
import { UserRole } from './models';

export const authenticatedGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.token) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }
  if (auth.user && auth.hasValidatedSession) return true;

  return auth.restoreSession().pipe(
    map(() => true),
    catchError(() => {
      auth.logout();
      return of(router.createUrlTree(['/login'], { queryParams: { expired: '1' } }));
    }),
  );
};

export const roleGuard = (role: UserRole): CanActivateFn => () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.user) return router.createUrlTree(['/login']);
  return auth.user.role === role ? true : router.createUrlTree([auth.user.role === 'admin' ? '/admin' : '/dashboard']);
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.token) return true;
  if (auth.user && auth.hasValidatedSession) return router.createUrlTree([auth.user.role === 'admin' ? '/admin' : '/dashboard']);

  return auth.restoreSession().pipe(
    map((user) => router.createUrlTree([user.role === 'admin' ? '/admin' : '/dashboard'])),
    catchError(() => {
      auth.logout();
      return of(true);
    }),
  );
};
