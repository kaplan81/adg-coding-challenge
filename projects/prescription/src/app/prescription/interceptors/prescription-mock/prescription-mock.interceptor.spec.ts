import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { PRESCRIPTIONS_SEED } from '../../mocks/prescriptions-seed.mock';
import type { PrescriptionPage } from '../../models/prescription.model';
import { prescriptionMockInterceptor } from './prescription-mock.interceptor';

const ENDPOINT = '/api/prescriptions';

describe('prescriptionMockInterceptor', () => {
  let http: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([prescriptionMockInterceptor]))],
    });
    http = TestBed.inject(HttpClient);
  });

  function fetchPage(params: Record<string, string>): Promise<PrescriptionPage> {
    return firstValueFrom(http.get<PrescriptionPage>(ENDPOINT, { params }));
  }

  describe('paging', () => {
    it('should return total equal to seed length when no filter is applied', async () => {
      const page = await fetchPage({ page: '1', pageSize: '10' });
      expect(page.total).toBe(PRESCRIPTIONS_SEED.length);
      expect(page.items.length).toBe(10);
      expect(page.page).toBe(1);
      expect(page.pageSize).toBe(10);
    });

    it('should respect the requested page index', async () => {
      const all = await fetchPage({ page: '1', pageSize: '500' });
      const second = await fetchPage({ page: '2', pageSize: '10' });
      expect(second.page).toBe(2);
      expect(second.pageSize).toBe(10);
      expect(second.total).toBe(all.total);
      expect(second.items.length).toBe(10);
      expect(second.items[0].id).toBe(all.items[10].id);
    });

    it('should return an empty page slice past the end', async () => {
      const overshoot = await fetchPage({ page: '999', pageSize: '10' });
      expect(overshoot.items.length).toBe(0);
      expect(overshoot.total).toBe(PRESCRIPTIONS_SEED.length);
    });

    it('should fall back to defaults for invalid page or pageSize', async () => {
      const page = await fetchPage({ page: '-3', pageSize: '0' });
      expect(page.page).toBe(1);
      expect(page.pageSize).toBe(10);
      expect(page.items.length).toBe(10);
    });
  });

  describe('search and filter', () => {
    it('should filter by free-text q across medication and insurant names', async () => {
      const page = await fetchPage({ page: '1', pageSize: '500', q: 'ibuprofen' });
      const allMatch = page.items.every(
        (p) =>
          p.medicationName.toLowerCase().includes('ibuprofen') ||
          p.insurantName.toLowerCase().includes('ibuprofen'),
      );
      expect(page.total).toBeGreaterThan(0);
      expect(allMatch).toBe(true);
    });

    it('should return zero results for a non-matching q', async () => {
      const page = await fetchPage({ page: '1', pageSize: '10', q: '___no-such-thing___' });
      expect(page.total).toBe(0);
      expect(page.items.length).toBe(0);
    });

    it('should filter by exact medication name', async () => {
      const sample = PRESCRIPTIONS_SEED[0].medicationName;
      const page = await fetchPage({ page: '1', pageSize: '500', medication: sample });
      const allMatch = page.items.every((p) => p.medicationName === sample);
      expect(page.total).toBeGreaterThan(0);
      expect(allMatch).toBe(true);
    });

    it('should filter by exact insurantId (single match)', async () => {
      const sampleId = PRESCRIPTIONS_SEED[0].insurantId;
      const page = await fetchPage({ page: '1', pageSize: '10', insurantId: sampleId });
      expect(page.total).toBe(1);
      expect(page.items[0].insurantId).toBe(sampleId);
    });
  });

  describe('sort', () => {
    it('should sort by prescriptionDate descending', async () => {
      const page = await fetchPage({
        page: '1',
        pageSize: '500',
        sort: 'prescriptionDate:desc',
      });
      const sortedDesc = page.items.every(
        (item, i) => i === 0 || page.items[i - 1].prescriptionDate >= item.prescriptionDate,
      );
      expect(sortedDesc).toBe(true);
    });

    it('should sort by medicationName ascending', async () => {
      const page = await fetchPage({
        page: '1',
        pageSize: '500',
        sort: 'medicationName:asc',
      });
      const sortedAsc = page.items.every(
        (item, i) => i === 0 || page.items[i - 1].medicationName <= item.medicationName,
      );
      expect(sortedAsc).toBe(true);
    });

    it('should ignore invalid sort and not change total', async () => {
      const noSort = await fetchPage({ page: '1', pageSize: '500' });
      const invalidField = await fetchPage({
        page: '1',
        pageSize: '500',
        sort: 'bogus:asc',
      });
      const invalidShape = await fetchPage({ page: '1', pageSize: '500', sort: 'medicationName' });
      expect(invalidField.total).toBe(noSort.total);
      expect(invalidShape.total).toBe(noSort.total);
    });
  });
});
