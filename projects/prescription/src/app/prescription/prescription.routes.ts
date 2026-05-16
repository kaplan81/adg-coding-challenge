import { Routes } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { prescriptionMockInterceptor } from './interceptors/prescription-mock/prescription-mock.interceptor';
import { PrescriptionService } from './services/prescription/prescription.service';

export const routes: Routes = [
  {
    path: '',
    providers: [
      provideHttpClient(withInterceptors([prescriptionMockInterceptor])),
      PrescriptionService,
    ],
    loadComponent: () =>
      import('./containers/prescription-list/prescription-list.component').then(
        (m) => m.PrescriptionListComponent,
      ),
  },
];
