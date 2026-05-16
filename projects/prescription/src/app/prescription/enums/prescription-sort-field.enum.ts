export enum PrescriptionSortField {
  medicationName,
  insurantName,
  insurantBirthDate,
  insurantId,
  prescriptionDate,
}

export type PrescriptionSortFieldET = keyof typeof PrescriptionSortField;
