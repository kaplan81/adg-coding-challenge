import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'prx-prescription-pager',
  templateUrl: './prescription-pager.component.html',
  styleUrl: './prescription-pager.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrescriptionPagerComponent {
  static readonly pageSizes: ReadonlyArray<number> = [10, 25, 50];

  canGoNext = computed(() => this.page() < this.totalPages());
  canGoPrev = computed(() => this.page() > 1);
  page = input.required<number>();
  pageChange = output<number>();
  pageSize = input.required<number>();
  pageSizeChange = output<number>();
  pageSizeOptionValues = PrescriptionPagerComponent.pageSizes;
  rangeEnd = computed(() => Math.min(this.page() * this.pageSize(), this.total()));
  rangeStart = computed(() => (this.total() === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1));
  total = input.required<number>();
  totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));

  onNext(): void {
    if (this.canGoNext()) {
      this.pageChange.emit(this.page() + 1);
    }
  }

  onPageSizeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.pageSizeChange.emit(Number(target.value));
  }

  onPrev(): void {
    if (this.canGoPrev()) {
      this.pageChange.emit(this.page() - 1);
    }
  }
}
