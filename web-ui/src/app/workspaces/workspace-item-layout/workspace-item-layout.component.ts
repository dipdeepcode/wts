import { Component, computed, inject, input, output } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

@Component({
  selector: 'app-workspace-layout',
  imports: [RouterLink],
  templateUrl: './workspace-item-layout.component.html',
  styleUrl: './workspace-item-layout.component.css',
})
export class WorkspaceItemLayoutComponent {
  private router = inject(Router);

  private currentUrl = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  mainLink = input.required<string[] | string>();
  editLink = input.required<string[] | string>();
  showMenu = input.required<boolean>();
  imageSrc = input('/task-management-logo.png');
  imageAlt = input('');

  deleteClickEvent = output<void>();

  isActive = computed(() => {
    const url = decodeURIComponent(this.currentUrl()).split('/').slice(2).join('/');
    const targetLink = this.mainLink();
    const fullPath = Array.isArray(targetLink) ? targetLink[0] : targetLink;
    return url === fullPath || url.startsWith(`${fullPath}/`);
  });

  onDelete() {
    this.deleteClickEvent.emit();
  }
}
