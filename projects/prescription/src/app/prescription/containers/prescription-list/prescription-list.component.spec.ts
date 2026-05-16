import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { PrescriptionListComponent } from './prescription-list.component';
import { PrescriptionService } from '../../services/prescription/prescription.service';

const emptyPageMock = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 10,
};

describe('PrescriptionListComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrescriptionListComponent],
      providers: [
        {
          provide: PrescriptionService,
          useValue: {
            search: () => of(emptyPageMock),
          },
        },
      ],
    }).compileComponents();
  });

  it('should render the prescriptions heading and search input', async () => {
    const fixture = TestBed.createComponent(PrescriptionListComponent);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Prescriptions');
    expect(compiled.querySelector('input[type="search"]')).toBeTruthy();
  });
});
