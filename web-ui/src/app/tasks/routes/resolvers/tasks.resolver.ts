import { ResolveFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { TasksService } from '../../../core/services/tasks.service';
import { ROUTES_CONSTANTS } from '../../../routes-constants';
import { WorkspacesService } from '../../../core/services/workspaces.service';
import { catchError, EMPTY, Observable } from 'rxjs';
import { Task, UnpackedResourceCollection } from '../../../core/declarations';
import { ToastService } from '../../../core/services/toast.service';

export const tasksResolver: ResolveFn<UnpackedResourceCollection<Task>> = (route): Observable<UnpackedResourceCollection<Task>> => {
  const toastService = inject(ToastService);
  const router = inject(Router);
  const workspaceSlug = route.paramMap.get(ROUTES_CONSTANTS.workspaceSlug);
  const workspacesService = inject(WorkspacesService);
  const tasksService = inject(TasksService);
  const links = workspaceSlug ? workspacesService.getLinks(workspaceSlug) : null;

  return links
    ? tasksService.getAll(links).pipe(
        catchError(() => {
          toastService.show(`Unable to load "${workspaceSlug}" tasks`);
          router.navigate([ROUTES_CONSTANTS.workspaces]).then();
          return EMPTY;
        }),
      )
    : EMPTY;
};
