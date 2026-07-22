import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from './config.service';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LogoutService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);

  getLogoutOptions() {
    return lastValueFrom(
      this.http.post(this.config.logoutUri, null, {
        headers: {
          'X-POST-LOGOUT-SUCCESS-URI': 'http://dipdeepcode.ru',
        },
        observe: 'response',
      }),
    );
  }
}
