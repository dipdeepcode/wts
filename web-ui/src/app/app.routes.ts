import { Routes } from '@angular/router';
import { WelcomeComponent } from './welcome/welcome.component';
import { ROUTES_CONSTANTS } from './routes-constants';
import { workspacesResolver } from './workspaces/routes/resolvers/workspaces.resolver';
import { authGuard } from './auth/guard/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: WelcomeComponent,
    title: 'Welcome',
  },
  {
    path: ROUTES_CONSTANTS.workspaces,
    canActivate: [authGuard],
    resolve: { dummy: workspacesResolver },
    loadComponent: () => import('./main/main.component').then((mod) => mod.MainComponent),
    loadChildren: () =>
      import('./workspaces/routes/workspaces.routes').then((mod) => mod.workspacesRoutes),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./not-found/not-found.component').then((mod) => mod.NotFoundComponent),
  },
];
