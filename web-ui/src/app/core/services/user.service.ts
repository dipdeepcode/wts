import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserinfoDto } from '../declarations';
import { User } from '../user.model';
import { catchError, interval, Observable, of, Subscription, tap } from 'rxjs';
import { ConfigService } from './config.service';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);
  private readonly configService = inject(ConfigService);
  private refreshSub?: Subscription;
  private _user = signal<User>(User.ANONYMOUS);
  user = this._user.asReadonly();
  isUserStateReady = signal<boolean>(false);

  private setupAutoRefresh(user: UserinfoDto) {
    if (user.exp > 0 && user.exp < Number.MAX_SAFE_INTEGER / 1000) {
      const now = Date.now();
      const expMs = user.exp * 1000;

      if (expMs > now) {
        const delay = (expMs - now) * 0.8;
        if (delay > 2000 && delay < Number.MAX_SAFE_INTEGER) {
          this.refreshSub = interval(delay).subscribe(() => this.refresh().subscribe());
        }
      }
    }
  }

  refresh(): Observable<UserinfoDto | null> {
    this.refreshSub?.unsubscribe();

    return this.http.get<UserinfoDto>(this.configService.meUrl).pipe(
      tap((user) => {
        if (
          user.username !== this._user().name ||
          user.email !== this._user().email ||
          (user.roles || []).toString() !== this._user().roles.toString()
        ) {
          this._user.set(
            user.username ? new User(user.username, user.email, user.roles) : User.ANONYMOUS,
          );
        }

        this.setupAutoRefresh(user);

        this.isUserStateReady.set(true);
      }),
      catchError(() => {
        this._user.set(User.ANONYMOUS);
        this.isUserStateReady.set(true);
        this.toast.show('Failed to load user data');
        return of(null);
      }),
    );
  }
}
