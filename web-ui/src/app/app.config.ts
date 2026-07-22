import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { halInterceptor } from './core/interceptors/hal.interceptor';
import { ConfigService } from './core/services/config.service';
import { UserService } from './core/services/user.service';
import { lastValueFrom } from 'rxjs';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([halInterceptor])),
    provideAppInitializer(async () => {
      const configService = inject(ConfigService);
      const userService = inject(UserService);
      await configService.loadConfig();
      return lastValueFrom(userService.refresh());
    }),
  ],
};
