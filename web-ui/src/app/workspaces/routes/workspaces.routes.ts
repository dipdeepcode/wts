import { Routes } from '@angular/router';
import { NoWorkspaceSelected } from '../no-workspace-selected/no-workspace-selected.component';
import { ROUTES_CONSTANTS } from '../../routes-constants';
import { tasksRoutes } from '../../tasks/routes/tasks.routes';
import { workspaceExistsGuard } from './guards/workspace-exists.guard';
import { workspaceResolver } from './resolvers/workspace.resolver';
import { canLeaveWorkspaceForm } from './guards/can-leave-workspace-form.guard';

export const workspacesRoutes: Routes = [
  {
    path: '',
    component: NoWorkspaceSelected,
    title: 'Select Workspace',
  },
  {
    path: ROUTES_CONSTANTS.newWorkspace,
    loadComponent: () =>
      import('../workspace-form/workspace-form.component').then(
        (mod) => mod.WorkspaceFormComponent,
      ),
    data: { isEdit: false },
    title: 'New Workspace',
    canDeactivate: [canLeaveWorkspaceForm],
  },
  {
    path: `:${ROUTES_CONSTANTS.workspaceSlug}`,
    canActivate: [workspaceExistsGuard],
    children: [
      {
        path: ROUTES_CONSTANTS.editWorkspace,
        resolve: { dummy: workspaceResolver },
        loadComponent: () =>
          import('../workspace-form/workspace-form.component').then(
            (mod) => mod.WorkspaceFormComponent,
          ),
        data: { isEdit: true },
        title: 'Edit Workspace',
        canDeactivate: [canLeaveWorkspaceForm],
      },
      ...tasksRoutes,
    ],
  },
];
