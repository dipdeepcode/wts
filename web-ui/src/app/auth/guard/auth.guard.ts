import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const userService = inject(UserService);

  return toObservable(userService.isUserStateReady).pipe(
    filter((ready) => ready),
    take(1),
    map(() => {
      if (userService.user().isAuthenticated) {
        return true;
      }
      return router.parseUrl('');
    }),
  );
};
