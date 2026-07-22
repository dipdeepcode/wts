import { Routes } from '@angular/router';
import { ROUTES_CONSTANTS } from '../../routes-constants';
import { TasksComponent } from '../tasks/tasks.component';
import { taskExistsGuard } from './guards/task-exists.guard';
import { tasksResolver } from './resolvers/tasks.resolver';
import { taskResolver } from './resolvers/task.resolver';
import { canLeaveTaskForm } from './guards/can-leave-task-form.guard';

export const tasksRoutes: Routes = [
  {
    path: '',
    redirectTo: ROUTES_CONSTANTS.tasks,
    pathMatch: 'full',
  },
  {
    path: ROUTES_CONSTANTS.tasks,
    resolve: { dummy: tasksResolver },
    children: [
      {
        path: '',
        component: TasksComponent,
        title: 'Tasks',
      },
      {
        path: ROUTES_CONSTANTS.newTask,
        loadComponent: () =>
          import('../task-form/task-form.component').then((mod) => mod.TaskFormComponent),
        data: { isEdit: false },
        title: 'New Task',
        canDeactivate: [canLeaveTaskForm],
      },
      {
        path: `:${ROUTES_CONSTANTS.taskSlug}`,
        canActivate: [taskExistsGuard],
        children: [
          {
            path: ROUTES_CONSTANTS.editTask,
            resolve: { dummy: taskResolver },
            loadComponent: () =>
              import('../task-form/task-form.component').then((mod) => mod.TaskFormComponent),
            data: { isEdit: true },
            title: 'Edit Task',
            canDeactivate: [canLeaveTaskForm],
          },
        ],
      },
    ],
  },
];
