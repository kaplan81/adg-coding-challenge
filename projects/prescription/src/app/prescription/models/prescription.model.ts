export interface PrescriptionPage {
  items: ReadonlyArray<Prescription>;
  total: number;
  page: number;
  pageSize: number;
}

export interface Prescription {
  id: string;
  medicationName: string;
  insurantName: string;
  insurantBirthDate: string;
  insurantId: string;
  prescriptionDate: string;
}
