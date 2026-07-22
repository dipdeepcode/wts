import { Component, DestroyRef, inject } from '@angular/core';

import { Resource, Workspace } from '../../core/declarations';
import { WorkspaceComponent } from '../workspace/workspace.component';
import { WorkspaceItemCreateComponent } from '../workspace-item-create/workspace-item-create.component';
import { WorkspacesService } from '../../core/services/workspaces.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, switchMap, tap } from 'rxjs';
import { ToastService } from '../../core/services/toast.service';
import { ROUTES_CONSTANTS } from '../../routes-constants';
import { Router } from '@angular/router';

@Component({
  selector: 'app-workspaces',
  imports: [WorkspaceComponent, WorkspaceItemCreateComponent],
  templateUrl: './workspaces.component.html',
  styleUrl: './workspaces.component.css',
})
export class WorkspacesComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toastService = inject(ToastService);
  private readonly workspacesService = inject(WorkspacesService);
  protected workspaces = this.workspacesService.resources;

  protected onDeleteClick(workspace: Resource<Workspace>) {
    if (
      window.confirm(
        `Do you really want to remove workspace "${workspace.name}"? You will lose all data.`,
      )
    ) {
      this.workspacesService
        .delete(workspace)
        .pipe(
          tap(() => this.toastService.show(`Workspace "${workspace.name}" deleted`)),
          switchMap(() =>
            this.workspacesService.getAll().pipe(
              catchError(() => {
                this.toastService.show('Failed to refresh workspaces list');
                return EMPTY;
              }),
            ),
          ),
          catchError(() => {
            this.toastService.show(`Failed to delete workspace "${workspace.name}"`);
            return EMPTY;
          }),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe({
          next: () => this.router.navigate([ROUTES_CONSTANTS.workspaces]).then()
        });
    }
  }
}
