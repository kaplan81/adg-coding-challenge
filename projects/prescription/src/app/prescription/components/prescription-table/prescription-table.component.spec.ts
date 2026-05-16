import { TestBed } from '@angular/core/testing';

import { PrescriptionTableComponent } from './prescription-table.component';
import type { Prescription } from '../../models/prescription.model';
import type { PrescriptionSort } from '../../models/prescription-query.model';

const sampleItems: ReadonlyArray<Prescription> = [
  {
    id: 'RX-00001',
    medicationName: 'Ibuprofen 400 mg',
    insurantName: 'Anna Müller',
    insurantBirthDate: '1980-01-15',
    insurantId: 'A100000000',
    prescriptionDate: '2025-01-15',
  },
  {
    id: 'RX-00002',
    medicationName: 'Amoxicillin 500 mg',
    insurantName: 'Jonas Schmidt',
    insurantBirthDate: '1975-03-22',
    insurantId: 'A100000007',
    prescriptionDate: '2024-12-01',
  },
];

describe('PrescriptionTableComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrescriptionTableComponent],
    }).compileComponents();
  });

  it('should render the five required column headers', async () => {
    const fixture = TestBed.createComponent(PrescriptionTableComponent);
    fixture.componentRef.setInput('items', sampleItems);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const labels = Array.from(compiled.querySelectorAll('th button span:first-child')).map(
      (el) => el.textContent?.trim(),
    );
    expect(labels).toEqual([
      'Medication name',
      'Insurant name',
      'Insurant birth date',
      'Insurant id',
      'Prescription date',
    ]);
  });

  it('should render one row per item with the expected cell content', async () => {
    const fixture = TestBed.createComponent(PrescriptionTableComponent);
    fixture.componentRef.setInput('items', sampleItems);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const rows = Array.from(compiled.querySelectorAll('tbody tr'));
    expect(rows.length).toBe(2);
    const firstRowText = rows[0].textContent ?? '';
    expect(firstRowText).toContain('Ibuprofen 400 mg');
    expect(firstRowText).toContain('Anna Müller');
    expect(firstRowText).toContain('A100000000');
  });

  it('should render the empty state when items is empty', async () => {
    const fixture = TestBed.createComponent(PrescriptionTableComponent);
    fixture.componentRef.setInput('items', []);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('No prescriptions match your search.');
  });

  it('should expose aria-sort for the active sorted column', async () => {
    const sort: PrescriptionSort = { field: 'prescriptionDate', direction: 'desc' };
    const fixture = TestBed.createComponent(PrescriptionTableComponent);
    fixture.componentRef.setInput('items', sampleItems);
    fixture.componentRef.setInput('sort', sort);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const headers = Array.from(compiled.querySelectorAll('th'));
    const activeHeader = headers[headers.length - 1];
    const otherHeader = headers[0];
    expect(activeHeader.getAttribute('aria-sort')).toBe('descending');
    expect(otherHeader.getAttribute('aria-sort')).toBe('none');
  });

  it('should cycle sort: none -> asc on first click', async () => {
    const fixture = TestBed.createComponent(PrescriptionTableComponent);
    fixture.componentRef.setInput('items', sampleItems);
    fixture.detectChanges();
    await fixture.whenStable();

    let emitted: PrescriptionSort | null | undefined;
    fixture.componentInstance.sortChange.subscribe((value) => {
      emitted = value;
    });

    const firstHeaderButton = fixture.nativeElement.querySelector(
      '.prx-prescription-table__header-button',
    ) as HTMLButtonElement | null;
    firstHeaderButton?.click();
    expect(emitted).toEqual({ field: 'medicationName', direction: 'asc' });
  });

  it('should cycle sort: asc -> desc -> null on subsequent clicks of the same column', async () => {
    const fixture = TestBed.createComponent(PrescriptionTableComponent);
    fixture.componentRef.setInput('items', sampleItems);
    fixture.componentRef.setInput('sort', { field: 'medicationName', direction: 'asc' });
    fixture.detectChanges();
    await fixture.whenStable();

    let emitted: PrescriptionSort | null | undefined;
    fixture.componentInstance.sortChange.subscribe((value) => {
      emitted = value;
    });

    const firstHeaderButton = fixture.nativeElement.querySelector(
      '.prx-prescription-table__header-button',
    ) as HTMLButtonElement | null;

    firstHeaderButton?.click();
    expect(emitted).toEqual({ field: 'medicationName', direction: 'desc' });

    fixture.componentRef.setInput('sort', { field: 'medicationName', direction: 'desc' });
    fixture.detectChanges();
    firstHeaderButton?.click();
    expect(emitted).toBe(null);
  });
});
