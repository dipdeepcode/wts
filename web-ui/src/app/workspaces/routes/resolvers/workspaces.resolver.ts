import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { WorkspacesService } from '../../../core/services/workspaces.service';
import { Workspace, UnpackedResourceCollection } from '../../../core/declarations';
import { catchError, EMPTY, Observable } from 'rxjs';
import { ToastService } from '../../../core/services/toast.service';

export const workspacesResolver: ResolveFn<UnpackedResourceCollection<Workspace>> = (): Observable<UnpackedResourceCollection<Workspace>> => {
  const toastService = inject(ToastService);
  const workspacesService = inject(WorkspacesService);

  return workspacesService.getAll().pipe(
    catchError(() => {
      toastService.show('Unable to load workspaces');
      return EMPTY;
    }),
  );
};
