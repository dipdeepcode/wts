import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class LoggingLevelService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);

  setLoggingLevel(loggingLevel: string) {
    return this.http.post(this.config.loggingLevelUri, {
      'level': loggingLevel
    });
  }
}
