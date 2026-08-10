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
      const baseUri = window.location.origin;
      const loginUrl = new URL(loginOptions.loginUri, baseUri);

      const successUrl = new URL(ROUTES_CONSTANTS.workspaces, baseUri);
      const failureUrl = new URL('/', baseUri);

      loginUrl.searchParams.append('post_login_success_uri', successUrl.toString());
      loginUrl.searchParams.append('post_login_failure_uri', failureUrl.toString());

      window.location.href = loginUrl.toString();
    } catch (e) {
      this.toast.show('Invalid Login URI');
    }
  }
}
