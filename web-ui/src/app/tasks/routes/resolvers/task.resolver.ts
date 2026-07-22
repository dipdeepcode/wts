import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { TasksService } from '../../../core/services/tasks.service';
import { ROUTES_CONSTANTS } from '../../../routes-constants';
import { Resource, Task } from '../../../core/declarations';
import { catchError, EMPTY, Observable } from 'rxjs';
import { ToastService } from '../../../core/services/toast.service';

export const taskResolver: ResolveFn<Resource<Task> | null> = (route): Observable<Resource<Task> | null> => {
  const toastService = inject(ToastService);
  const slug = route.paramMap.get(ROUTES_CONSTANTS.taskSlug);
  const tasksService = inject(TasksService);

  if (!slug) {
    return null as unknown as Observable<Resource<Task> | null>;
  }

  return tasksService.getOne(slug).pipe(
    catchError(() => {
      toastService.show('Unable to load task');
      return EMPTY;
    }),
  );
};
