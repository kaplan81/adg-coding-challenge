import type { Prescription } from '../models/prescription.model';

const MEDICATIONS: ReadonlyArray<string> = [
  'Ibuprofen 400 mg',
  'Amoxicillin 500 mg',
  'Lisinopril 10 mg',
  'Metformin 850 mg',
  'Atorvastatin 20 mg',
  'Levothyroxine 50 µg',
  'Omeprazole 20 mg',
  'Salbutamol 100 µg',
  'Simvastatin 40 mg',
  'Paracetamol 500 mg',
  'Ramipril 5 mg',
  'Pantoprazole 40 mg',
  'Sertraline 50 mg',
  'Bisoprolol 5 mg',
  'Hydrochlorothiazide 25 mg',
];

const FIRST_NAMES: ReadonlyArray<string> = [
  'Anna',
  'Jonas',
  'Lena',
  'Tobias',
  'Sophie',
  'Felix',
  'Marie',
  'Lukas',
  'Hannah',
  'Paul',
  'Lea',
  'Maximilian',
  'Lara',
  'Niklas',
  'Mia',
];

const LAST_NAMES: ReadonlyArray<string> = [
  'Müller',
  'Schmidt',
  'Schneider',
  'Fischer',
  'Weber',
  'Meyer',
  'Wagner',
  'Becker',
  'Schulz',
  'Hoffmann',
  'Schäfer',
  'Koch',
  'Bauer',
  'Richter',
  'Klein',
];

const SEED_COUNT = 150;

function pad(value: number, size = 2): string {
  return String(value).padStart(size, '0');
}

function isoDate(year: number, month: number, day: number): string {
  return `${year}-${pad(month)}-${pad(day)}`;
}

function buildSeed(): ReadonlyArray<Prescription> {
  return Array.from({ length: SEED_COUNT }, (_, i): Prescription => {
    const medication = MEDICATIONS[i % MEDICATIONS.length];
    const firstName = FIRST_NAMES[(i * 3 + 1) % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(i * 7 + 2) % LAST_NAMES.length];

    const birthYear = 1940 + ((i * 13) % 70);
    const birthMonth = 1 + ((i * 5 + 1) % 12);
    const birthDay = 1 + ((i * 11) % 28);

    const prescriptionYear = 2023 + (i % 3);
    const prescriptionMonth = 1 + ((i * 7) % 12);
    const prescriptionDay = 1 + ((i * 17) % 28);

    return {
      id: `RX-${pad(i + 1, 5)}`,
      medicationName: medication,
      insurantName: `${firstName} ${lastName}`,
      insurantBirthDate: isoDate(birthYear, birthMonth, birthDay),
      insurantId: `A${String(100000000 + i * 7)}`,
      prescriptionDate: isoDate(prescriptionYear, prescriptionMonth, prescriptionDay),
    };
  });
}

export const PRESCRIPTIONS_SEED: ReadonlyArray<Prescription> = buildSeed();
