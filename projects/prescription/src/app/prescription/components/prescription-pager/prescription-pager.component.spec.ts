import { TestBed } from '@angular/core/testing';

import { PrescriptionPagerComponent } from './prescription-pager.component';

describe('PrescriptionPagerComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrescriptionPagerComponent],
    }).compileComponents();
  });

  it('should render the range and total summary', async () => {
    const fixture = TestBed.createComponent(PrescriptionPagerComponent);
    fixture.componentRef.setInput('page', 2);
    fixture.componentRef.setInput('pageSize', 10);
    fixture.componentRef.setInput('total', 27);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('11–20 of 27');
    expect(compiled.textContent).toContain('Page 2 / 3');
  });

  it('should disable Previous on the first page and Next on the last page', async () => {
    const fixture = TestBed.createComponent(PrescriptionPagerComponent);
    fixture.componentRef.setInput('page', 1);
    fixture.componentRef.setInput('pageSize', 10);
    fixture.componentRef.setInput('total', 10);
    fixture.detectChanges();
    await fixture.whenStable();
    const buttons = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>(
        '.prx-prescription-pager__button',
      ),
    );
    expect(buttons[0].disabled).toBe(true);
    expect(buttons[1].disabled).toBe(true);
  });

  it('should emit pageChange when Next is clicked', async () => {
    const fixture = TestBed.createComponent(PrescriptionPagerComponent);
    fixture.componentRef.setInput('page', 1);
    fixture.componentRef.setInput('pageSize', 10);
    fixture.componentRef.setInput('total', 50);
    fixture.detectChanges();
    await fixture.whenStable();

    let emitted: number | undefined;
    fixture.componentInstance.pageChange.subscribe((value) => {
      emitted = value;
    });
    const buttons = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>(
        '.prx-prescription-pager__button',
      ),
    );
    buttons[1].click();
    expect(emitted).toBe(2);
  });

  it('should emit pageSizeChange when the select changes', async () => {
    const fixture = TestBed.createComponent(PrescriptionPagerComponent);
    fixture.componentRef.setInput('page', 1);
    fixture.componentRef.setInput('pageSize', 10);
    fixture.componentRef.setInput('total', 50);
    fixture.detectChanges();
    await fixture.whenStable();

    let emitted: number | undefined;
    fixture.componentInstance.pageSizeChange.subscribe((value) => {
      emitted = value;
    });
    const select = (fixture.nativeElement as HTMLElement).querySelector(
      'select',
    ) as HTMLSelectElement;
    select.value = '25';
    select.dispatchEvent(new Event('change'));
    expect(emitted).toBe(25);
  });
});
