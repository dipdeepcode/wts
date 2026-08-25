import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { LoginComponent } from './login/login.component';
import { UserService } from '../core/services/user.service';
import { LogoutComponent } from './logout/logout.component';
import { AuthService } from '../core/services/auth.service';
import { LoginOptionDto } from '../core/declarations';
import { ToastService } from '../core/services/toast.service';

@Component({
  selector: 'app-auth',
  imports: [LoginComponent, LogoutComponent],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css',
})
export class AuthComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  protected loginOptions = signal<LoginOptionDto | undefined>(undefined);
  private userService = inject(UserService);
  protected isUserStateReady = this.userService.isUserStateReady;
  protected isAuthenticated = computed(() => this.userService.user().isAuthenticated);

  ngOnInit(): void {
    this.authService.getLoginOptions().subscribe({
      next: (data) => this.loginOptions.set(data),
      error: () => this.toast.show('Failed to load login options'),
    });
  }

  protected redirectToAccountConsole() {
    const loginOptions = this.loginOptions();
    console.dir(loginOptions);

    if (!loginOptions) {
      return;
    }

    try {
      const url = new URL(loginOptions.accountConsoleUrl);
      const currentUrl = window.location.href;
      url.searchParams.append('referrer', 'WTS');
      url.searchParams.append('referrer_uri', currentUrl);
      window.location.href = url.toString();
    } catch (e) {
      this.toast.show('Invalid Account console URI');
    }
  }
}
