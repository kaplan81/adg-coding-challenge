import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('../prescription/prescription.routes').then((feature) => feature.routes),
  },
];
