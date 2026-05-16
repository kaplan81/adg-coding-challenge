export type PrescriptionSortField =
  | 'medicationName'
  | 'insurantName'
  | 'insurantBirthDate'
  | 'insurantId'
  | 'prescriptionDate';

export type PrescriptionSortDirection = 'asc' | 'desc';

export interface PrescriptionSort {
  readonly field: PrescriptionSortField;
  readonly direction: PrescriptionSortDirection;
}

export interface PrescriptionQuery {
  readonly q?: string;
  readonly medication?: string;
  readonly insurantId?: string;
  readonly page: number;
  readonly pageSize: number;
  readonly sort?: PrescriptionSort;
}
