import { Component, inject } from '@angular/core';
import { AuthComponent } from '../auth/auth.component';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  imports: [AuthComponent],
})
export class HeaderComponent {
  private http = inject(HttpClient);
  protected get_api_me2() {
    this.http.get('/me').subscribe({
      next: (resp) => console.dir(resp)
    })
  }
}
