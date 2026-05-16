import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  resource,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
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
  #destroyRef = inject(DestroyRef);
  #query = computed<PrescriptionQuery>(() => {
    const sort = this.sort();
    return {
      q: this.#searchTerm() || undefined,
      page: this.page(),
      pageSize: this.pageSize(),
      sort: sort ?? undefined,
    };
  });
  #searchTerm = signal('');
  #service = inject(PrescriptionService);

  page = signal(1);
  pageResource = resource({
    params: () => this.#query(),
    loader: ({ params }) => firstValueFrom(this.#service.search(params)),
  });
  pageSize = signal(DEFAULT_PAGE_SIZE);
  searchControl = new FormControl('', { nonNullable: true });
  sort = signal<PrescriptionSort | null>(DEFAULT_SORT);

  constructor() {
    this.searchControl.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged(), takeUntilDestroyed(this.#destroyRef))
      .subscribe((value) => {
        this.#searchTerm.set(value ?? '');
        this.page.set(1);
      });
  }

  onPageChange(pageIndex: number): void {
    this.page.set(pageIndex);
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.page.set(1);
  }

  onReload(): void {
    this.pageResource.reload();
  }

  onSortChange(nextSort: PrescriptionSort | null): void {
    this.sort.set(nextSort);
    this.page.set(1);
  }
}
