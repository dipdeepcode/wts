import { Component, DestroyRef, inject, signal } from '@angular/core';
import { HalService } from '../core/services/hal.service';
import { Workspace, UnpackedResourceCollection } from '../core/declarations';
import { JsonPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-welcome',
  imports: [JsonPipe],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css',
})
export class WelcomeComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly halService = inject(HalService);
  protected response = signal<UnpackedResourceCollection<Workspace> | null>(null);

  protected getRootResourceCollection(): void {
    this.halService
      .getResourceCollection<Workspace>('workspaces')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp) => this.response.set(resp),
      });
  }
}
