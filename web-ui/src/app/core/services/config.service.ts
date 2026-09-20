import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AppConfig } from '../declarations';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private http = inject(HttpClient);
  private config: AppConfig | null = null;

  async loadConfig(): Promise<void> {
    this.config = await firstValueFrom(this.http.get<AppConfig>('/config.json'));
  }

  get baseUrl(): string {
    return this.config?.baseUrl ?? '';
  }

  get meUrl(): string {
    return this.config?.meUrl ?? '';
  }

  get loginOptionsUrl(): string {
    return this.config?.loginOptionsUrl ?? '';
  }

  get logoutUri(): string {
    return this.config?.logoutUri ?? '';
  }
}
