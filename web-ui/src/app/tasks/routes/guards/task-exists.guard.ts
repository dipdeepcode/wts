import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { TasksService } from '../../../core/services/tasks.service';
import { ROUTES_CONSTANTS } from '../../../routes-constants';

export const taskExistsGuard: CanActivateFn = (route): UrlTree | boolean => {
  const router = inject(Router);
  const tasksService = inject(TasksService);
  const slug = route.paramMap.get(ROUTES_CONSTANTS.taskSlug);

  if (!slug) {
    return router.createUrlTree([ROUTES_CONSTANTS.tasks]);
  }

  const exists = tasksService
    .resources()
    ?.some((task) => tasksService.findPredicate(task, slug));

  return exists || router.createUrlTree([ROUTES_CONSTANTS.tasks]);
};
