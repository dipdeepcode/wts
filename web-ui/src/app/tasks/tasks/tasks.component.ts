import { Component, computed, DestroyRef, inject, input } from '@angular/core';
import { TaskComponent } from '../task/task.component';
import { ManageLayoutComponent } from '../../manage-layout/manage-layout.component';
import { TasksService } from '../../core/services/tasks.service';
import { Resource, Task, SlugType, Links } from '../../core/declarations';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, switchMap, tap } from 'rxjs';
import { WorkspacesService } from '../../core/services/workspaces.service';
import { ToastService } from '../../core/services/toast.service';
import { Router } from '@angular/router';
import { ROUTES_CONSTANTS } from '../../routes-constants';

@Component({
  selector: 'app-tasks',
  imports: [TaskComponent, ManageLayoutComponent],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css',
})
export class TasksComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly tasksService = inject(TasksService);
  protected tasks = this.tasksService.resources;
  private readonly workspacesService = inject(WorkspacesService);
  protected workspaceSlug = input.required<SlugType>();
  private workspace = computed(() =>
    this.workspacesService.getResourceBySlug(this.workspaceSlug()),
  );
  protected readonly layoutHeader = computed<string>(() => `"${this.workspace()?.name}" tasks`);

  protected onDeleteClick(task: Resource<Task>) {
    if (
      window.confirm(`Do you really want to remove task "${task.title}"? You will lose all data.`)
    ) {
      const links: Links = { _links: this.workspace()!._links };
      this.tasksService
        .delete(task)
        .pipe(
          tap(() => this.toastService.show(`Task "${task.title}" deleted`)),
          switchMap(() => {
            if (!links) return EMPTY;
            return this.tasksService.getAll(links).pipe(
              catchError(() => {
                this.toastService.show(
                  `Failed to refresh "${this.workspace()?.name}" tasks list`,
                );
                this.router.navigate([ROUTES_CONSTANTS.workspaces]).then();
                return EMPTY;
              }),
            );
          }),
          catchError(() => {
            this.toastService.show(`Failed to delete task "${task.title}"`);
            return EMPTY;
          }),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe();
    }
  }
}
