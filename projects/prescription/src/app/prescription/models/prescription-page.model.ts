import type { Prescription } from './prescription.model';

export interface PrescriptionPage {
  readonly items: ReadonlyArray<Prescription>;
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}
