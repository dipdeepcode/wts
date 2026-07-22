import { Component, inject } from '@angular/core';
import { LogoutService } from '../../core/services/logout.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-logout',
  imports: [],
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.css',
})
export class LogoutComponent {
  private readonly logoutService = inject(LogoutService);
  private readonly userService = inject(UserService);

  protected logout() {
    this.logoutService
      .getLogoutOptions()
      .then((resp) => {
        const logoutUri = resp.headers.get('Location');
        if (!!logoutUri) {
          window.location.href = logoutUri;
        }
      })
      .finally(() => {
        this.userService.refresh().subscribe();
      });
  }
}
