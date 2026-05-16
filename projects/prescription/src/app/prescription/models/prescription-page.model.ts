import type { Prescription } from './prescription.model';

export interface PrescriptionPage {
  items: ReadonlyArray<Prescription>;
  total: number;
  page: number;
  pageSize: number;
}
