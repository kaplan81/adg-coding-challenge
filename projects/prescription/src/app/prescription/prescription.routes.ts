import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./containers/prescription-list/prescription-list.component').then(
        (m) => m.PrescriptionListComponent,
      ),
  },
];
