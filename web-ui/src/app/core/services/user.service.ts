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
  private _user = signal<User>(User.ANONYMOUS);
  user = this._user.asReadonly();
  isUserStateReady = signal<boolean>(false);

  refresh(): Observable<UserinfoDto | null> {
    return this.http.get<UserinfoDto>(this.configService.meUrl).pipe(
      tap((user) => {
        this._user.set(new User(user.username, user.email, user.roles));
        this.isUserStateReady.set(true);
      }),
      catchError((error) => {
        this._user.set(User.ANONYMOUS);
        this.isUserStateReady.set(true);
        if (error.status !== 401) {
          this.toast.show('Failed to load user data');
        }
        return of(null);
      }),
    );
  }
}
