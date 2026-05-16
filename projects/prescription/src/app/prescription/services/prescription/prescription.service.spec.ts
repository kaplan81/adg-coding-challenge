import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import type { PrescriptionPage } from '../../models/prescription.model';
import { PrescriptionService } from './prescription.service';

const emptyPageMock: PrescriptionPage = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 10,
};

describe('PrescriptionService', () => {
  let service: PrescriptionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), PrescriptionService],
    });
    service = TestBed.inject(PrescriptionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be injectable', () => {
    expect(service).toBeTruthy();
  });

  describe('search()', () => {
    it('should issue a GET to /api/prescriptions with page and pageSize', () => {
      service.search({ page: 2, pageSize: 25 }).subscribe();
      const req = httpMock.expectOne((r) => r.url === '/api/prescriptions');
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('pageSize')).toBe('25');
      req.flush(emptyPageMock);
    });

    it('should include q, medication, insurantId and sort when provided', () => {
      service
        .search({
          page: 1,
          pageSize: 10,
          q: 'ibuprofen',
          medication: 'Ibuprofen 400 mg',
          insurantId: 'A100000000',
          sort: { field: 'prescriptionDate', direction: 'desc' },
        })
        .subscribe();
      const req = httpMock.expectOne((r) => r.url === '/api/prescriptions');
      expect(req.request.params.get('q')).toBe('ibuprofen');
      expect(req.request.params.get('medication')).toBe('Ibuprofen 400 mg');
      expect(req.request.params.get('insurantId')).toBe('A100000000');
      expect(req.request.params.get('sort')).toBe('prescriptionDate:desc');
      req.flush(emptyPageMock);
    });

    it('should omit optional params when not provided', () => {
      service.search({ page: 1, pageSize: 10 }).subscribe();
      const req = httpMock.expectOne((r) => r.url === '/api/prescriptions');
      expect(req.request.params.has('q')).toBe(false);
      expect(req.request.params.has('medication')).toBe(false);
      expect(req.request.params.has('insurantId')).toBe(false);
      expect(req.request.params.has('sort')).toBe(false);
      req.flush(emptyPageMock);
    });

    it('should pass through the response body', () => {
      const responseMock: PrescriptionPage = {
        items: [
          {
            id: 'RX-00001',
            medicationName: 'Ibuprofen 400 mg',
            insurantName: 'Anna Müller',
            insurantBirthDate: '1980-01-15',
            insurantId: 'A100000000',
            prescriptionDate: '2025-01-15',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 10,
      };
      let received: PrescriptionPage | null = null;
      service.search({ page: 1, pageSize: 10 }).subscribe((page) => {
        received = page;
      });
      const req = httpMock.expectOne((r) => r.url === '/api/prescriptions');
      req.flush(responseMock);
      expect(received).toEqual(responseMock);
    });
  });
});
