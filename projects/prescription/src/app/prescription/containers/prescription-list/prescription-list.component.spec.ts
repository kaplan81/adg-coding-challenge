import { TestBed } from '@angular/core/testing';

import { PrescriptionListComponent } from './prescription-list.component';

describe('PrescriptionListComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrescriptionListComponent],
    }).compileComponents();
  });

  it('should render the prescriptions heading', async () => {
    const fixture = TestBed.createComponent(PrescriptionListComponent);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Prescriptions');
  });
});
