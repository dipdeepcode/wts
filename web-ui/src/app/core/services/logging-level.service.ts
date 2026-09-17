import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from './config.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoggingLevelService {
  private readonly http = inject(HttpClient);
  private readonly configService = inject(ConfigService);

  setLoggingLevel(loggingLevel: string): Observable<any> {
    return this.http.post(this.configService.loggingLevelUri, {
      'level': loggingLevel
    });
  }
}
