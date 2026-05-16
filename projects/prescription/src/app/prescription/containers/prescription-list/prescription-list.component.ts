import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  resource,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { PrescriptionPagerComponent } from '../../components/prescription-pager/prescription-pager.component';
import { PrescriptionTableComponent } from '../../components/prescription-table/prescription-table.component';
import type { PrescriptionQuery, PrescriptionSort } from '../../models/prescription-query.model';
import { PrescriptionService } from '../../services/prescription.service';

const DEFAULT_SORT: PrescriptionSort = {
  field: 'prescriptionDate',
  direction: 'desc',
};

const DEFAULT_PAGE_SIZE = 10;

@Component({
  selector: 'prx-prescription-list',
  imports: [ReactiveFormsModule, PrescriptionTableComponent, PrescriptionPagerComponent],
  templateUrl: './prescription-list.component.html',
  styleUrl: './prescription-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrescriptionListComponent {
  private readonly service = inject(PrescriptionService);

  protected readonly searchControl = new FormControl('', { nonNullable: true });

  protected readonly page = signal(1);
  protected readonly pageSize = signal(DEFAULT_PAGE_SIZE);
  protected readonly sort = signal<PrescriptionSort | null>(DEFAULT_SORT);
  private readonly searchTerm = signal('');

  private readonly query = computed<PrescriptionQuery>(() => {
    const sort = this.sort();
    return {
      q: this.searchTerm() || undefined,
      page: this.page(),
      pageSize: this.pageSize(),
      sort: sort ?? undefined,
    };
  });

  protected readonly pageResource = resource({
    params: () => this.query(),
    loader: ({ params }) => firstValueFrom(this.service.search(params)),
  });

  constructor() {
    this.searchControl.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((value) => {
        this.searchTerm.set(value ?? '');
        this.page.set(1);
      });
  }

  protected onSortChange(sort: PrescriptionSort | null): void {
    this.sort.set(sort);
    this.page.set(1);
  }

  protected onPageChange(page: number): void {
    this.page.set(page);
  }

  protected onPageSizeChange(pageSize: number): void {
    this.pageSize.set(pageSize);
    this.page.set(1);
  }

  protected onReload(): void {
    this.pageResource.reload();
  }
}
