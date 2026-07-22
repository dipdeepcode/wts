import { Component } from '@angular/core';
import { AuthComponent } from '../auth/auth.component';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  imports: [AuthComponent],
})
export class HeaderComponent {}
