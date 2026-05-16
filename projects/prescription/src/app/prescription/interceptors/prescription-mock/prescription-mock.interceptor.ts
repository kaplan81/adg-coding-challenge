import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

import type { Prescription } from '../../models/prescription.model';
import type { PrescriptionPage } from '../../models/prescription-page.model';
import type { PrescriptionSort } from '../../models/prescription-query.model';
import { PRESCRIPTIONS_SEED } from '../../mocks/prescriptions-seed.mock';

const ENDPOINT = '/api/prescriptions';
const MIN_LATENCY_MS = 150;
const MAX_LATENCY_MS = 250;
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

export const prescriptionMockInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'GET' || !req.url.startsWith(ENDPOINT)) {
    return next(req);
  }

  const page = parsePositiveInt(req.params.get('page'), DEFAULT_PAGE);
  const pageSize = parsePositiveInt(req.params.get('pageSize'), DEFAULT_PAGE_SIZE);
  const search = (req.params.get('q') ?? '').trim().toLowerCase();
  const medication = (req.params.get('medication') ?? '').trim();
  const insurantId = (req.params.get('insurantId') ?? '').trim();
  const sort = parseSort(req.params.get('sort'));

  const filtered = PRESCRIPTIONS_SEED.filter((prescription) =>
    matchesQuery(prescription, search, medication, insurantId),
  );
  const sorted = sort ? sortPrescriptions(filtered, sort) : filtered;
  const total = sorted.length;
  const start = (page - 1) * pageSize;
  const items = sorted.slice(start, start + pageSize);

  const body: PrescriptionPage = { items, total, page, pageSize };
  const latency = randomLatency();

  return of(new HttpResponse({ status: 200, body })).pipe(delay(latency));
};

function matchesQuery(
  prescription: Prescription,
  search: string,
  medication: string,
  insurantId: string,
): boolean {
  if (medication && prescription.medicationName !== medication) {
    return false;
  }
  if (insurantId && prescription.insurantId !== insurantId) {
    return false;
  }
  if (
    search &&
    !prescription.medicationName.toLowerCase().includes(search) &&
    !prescription.insurantName.toLowerCase().includes(search)
  ) {
    return false;
  }
  return true;
}

function sortPrescriptions(
  items: ReadonlyArray<Prescription>,
  sort: PrescriptionSort,
): ReadonlyArray<Prescription> {
  const factor = sort.direction === 'asc' ? 1 : -1;
  return [...items].sort((a, b) => {
    const left = a[sort.field];
    const right = b[sort.field];
    if (left < right) {
      return -factor;
    }
    if (left > right) {
      return factor;
    }
    return 0;
  });
}

function parsePositiveInt(raw: string | null, fallback: number): number {
  if (!raw) {
    return fallback;
  }
  const value = Number.parseInt(raw, 10);
  if (!Number.isFinite(value) || value <= 0) {
    return fallback;
  }
  return value;
}

function parseSort(raw: string | null): PrescriptionSort | null {
  if (!raw) {
    return null;
  }
  const parts = raw.split(':');
  if (parts.length !== 2) {
    return null;
  }
  const [field, direction] = parts;
  switch (field) {
    case 'medicationName':
    case 'insurantName':
    case 'insurantBirthDate':
    case 'insurantId':
    case 'prescriptionDate':
      break;
    default:
      return null;
  }
  if (direction !== 'asc' && direction !== 'desc') {
    return null;
  }
  return { field, direction };
}

function randomLatency(): number {
  return MIN_LATENCY_MS + Math.random() * (MAX_LATENCY_MS - MIN_LATENCY_MS);
}
