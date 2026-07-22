import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { WorkspacesService } from '../../../core/services/workspaces.service';
import { ROUTES_CONSTANTS } from '../../../routes-constants';
import { Workspace, Resource } from '../../../core/declarations';
import { ToastService } from '../../../core/services/toast.service';
import { catchError, EMPTY, Observable } from 'rxjs';

export const workspaceResolver: ResolveFn<Resource<Workspace> | null> = (route): Observable<Resource<Workspace> | null> => {
  const toastService = inject(ToastService);
  const slug = route.paramMap.get(ROUTES_CONSTANTS.workspaceSlug);
  const workspacesService = inject(WorkspacesService);

  if (!slug) {
    return null as unknown as Observable<Resource<Workspace> | null>;
  }

  return workspacesService.getOne(slug).pipe(
    catchError(() => {
      toastService.show('Unable to load workspace');
      return EMPTY;
    }),
  );
};
