import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { LoginService } from '../../core/services/login.service';
import { LoginOptionDto } from '../../core/declarations';
import { ToastService } from '../../core/services/toast.service';
import { ROUTES_CONSTANTS } from '../../routes-constants';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  private readonly toast = inject(ToastService);
  private readonly loginService = inject(LoginService);
  protected loginOptions = signal<LoginOptionDto | undefined>(undefined);
  protected isLoginEnabled = computed(() => !!this.loginOptions()?.loginUri);

  ngOnInit(): void {
    this.loginService.getLoginOptions().subscribe({
      next: (data) => this.loginOptions.set(data),
      error: () => this.toast.show('Failed to load login options'),
    });
  }

  protected login() {
    const loginOptions = this.loginOptions();

    if (!loginOptions?.loginUri) {
      return;
    }

    try {
      const loginUrl = new URL(loginOptions.loginUri, window.location.origin);
      loginUrl.searchParams.append(
        'post_login_success_uri', `http://dipdeepcode.ru/${ROUTES_CONSTANTS.workspaces}`,
      );
      loginUrl.searchParams.append(
        'post_login_failure_uri', 'http://dipdeepcode.ru'
      );
      window.location.href = loginUrl.toString();
    } catch (e) {
      this.toast.show('Invalid Login URI');
    }
  }
}
