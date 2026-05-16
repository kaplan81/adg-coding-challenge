import { Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';

export const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('../home/home.routes').then((feature) => feature.routes),
  },
  {
    path: 'prescriptions',
    loadChildren: () =>
      loadRemoteModule({
        remoteName: 'prescription',
        exposedModule: './Routes',
      }).then((m) => m.routes),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
