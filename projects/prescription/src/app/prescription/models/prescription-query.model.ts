import type { PrescriptionSortDirectionET } from '../enums/prescription-sort-direction.enum';
import type { PrescriptionSortFieldET } from '../enums/prescription-sort-field.enum';

export interface PrescriptionSort {
  field: PrescriptionSortFieldET;
  direction: PrescriptionSortDirectionET;
}

export interface PrescriptionQuery {
  q?: string;
  medication?: string;
  insurantId?: string;
  page: number;
  pageSize: number;
  sort?: PrescriptionSort;
}
