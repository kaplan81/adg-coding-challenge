import type { PrescriptionSortField } from '../../models/prescription-query.model';

export interface ColumnDef {
  field: PrescriptionSortField;
  label: string;
  type: 'text' | 'date';
}

export const PRESCRIPTION_TABLE_COLUMNS: ReadonlyArray<ColumnDef> = [
  { field: 'medicationName', label: 'Medication name', type: 'text' },
  { field: 'insurantName', label: 'Insurant name', type: 'text' },
  { field: 'insurantBirthDate', label: 'Insurant birth date', type: 'date' },
  { field: 'insurantId', label: 'Insurant id', type: 'text' },
  { field: 'prescriptionDate', label: 'Prescription date', type: 'date' },
];
