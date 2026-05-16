import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';

import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should render the brand and navigation', async () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.shl-header__brand')?.textContent).toContain('ADG Shell');
    expect(compiled.querySelectorAll('.shl-header__nav-link').length).toBeGreaterThan(0);
  });
});
