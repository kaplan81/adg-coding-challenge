export interface Prescription {
  readonly id: string;
  readonly medicationName: string;
  readonly insurantName: string;
  readonly insurantBirthDate: string;
  readonly insurantId: string;
  readonly prescriptionDate: string;
}
