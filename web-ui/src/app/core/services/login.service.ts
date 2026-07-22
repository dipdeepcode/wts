import { DestroyRef, inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoginOptionDto } from '../declarations';
import { ConfigService } from './config.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);
  private readonly destroyRef = inject(DestroyRef);

  getLoginOptions(): Observable<LoginOptionDto> {
    return this.http
      .get<LoginOptionDto>(this.config.loginOptionsUrl)
      .pipe(take(1), takeUntilDestroyed(this.destroyRef));
  }
}
