import { Component, computed, inject } from '@angular/core';
import { LoginComponent } from './login/login.component';
import { UserService } from '../core/services/user.service';
import { LogoutComponent } from './logout/logout.component';

@Component({
  selector: 'app-auth',
  imports: [LoginComponent, LogoutComponent],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css',
})
export class AuthComponent {
  private userService = inject(UserService);
  protected isUserStateReady = this.userService.isUserStateReady;
  protected isAuthenticated = computed(() => this.userService.user().isAuthenticated);
}
