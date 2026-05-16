export type PrescriptionSortField =
  | 'medicationName'
  | 'insurantName'
  | 'insurantBirthDate'
  | 'insurantId'
  | 'prescriptionDate';

export type PrescriptionSortDirection = 'asc' | 'desc';

export interface PrescriptionSort {
  field: PrescriptionSortField;
  direction: PrescriptionSortDirection;
}

export interface PrescriptionQuery {
  q?: string;
  medication?: string;
  insurantId?: string;
  page: number;
  pageSize: number;
  sort?: PrescriptionSort;
}
