import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { WorkspacesService } from '../../../core/services/workspaces.service';
import { ROUTES_CONSTANTS } from '../../../routes-constants';

export const workspaceExistsGuard: CanActivateFn = (route): UrlTree | boolean => {
  const router = inject(Router);
  const workspacesService = inject(WorkspacesService);
  const slug = route.paramMap.get(ROUTES_CONSTANTS.workspaceSlug);

  if (!slug) {
    return router.createUrlTree([ROUTES_CONSTANTS.workspaces]);
  }

  const exists = workspacesService
    .resources()
    ?.some((workspace) => workspacesService.findPredicate(workspace, slug));

  return exists || router.createUrlTree([ROUTES_CONSTANTS.workspaces]);
};
