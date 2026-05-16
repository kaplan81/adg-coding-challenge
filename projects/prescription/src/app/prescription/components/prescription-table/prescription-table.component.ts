import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import type { Prescription } from '../../models/prescription.model';
import type {
  PrescriptionSort,
  PrescriptionSortDirection,
  PrescriptionSortField,
} from '../../models/prescription-query.model';

import { PRESCRIPTION_TABLE_COLUMNS } from './prescription-table-columns.model';

@Component({
  selector: 'prx-prescription-table',
  imports: [DatePipe],
  templateUrl: './prescription-table.component.html',
  styleUrl: './prescription-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrescriptionTableComponent {
  static readonly tableColumns = PRESCRIPTION_TABLE_COLUMNS;

  columns = PrescriptionTableComponent.tableColumns;
  items = input.required<ReadonlyArray<Prescription>>();
  sort = input<PrescriptionSort | null>(null);
  sortChange = output<PrescriptionSort | null>();

  ariaSortFor(field: PrescriptionSortField): 'ascending' | 'descending' | 'none' {
    const direction = this.directionFor(field);
    if (direction === 'asc') {
      return 'ascending';
    }
    if (direction === 'desc') {
      return 'descending';
    }
    return 'none';
  }

  directionFor(field: PrescriptionSortField): PrescriptionSortDirection | null {
    const current = this.sort();
    if (!current || current.field !== field) {
      return null;
    }
    return current.direction;
  }

  onHeaderClick(field: PrescriptionSortField): void {
    const current = this.sort();
    if (!current || current.field !== field) {
      this.sortChange.emit({ field, direction: 'asc' });
      return;
    }
    if (current.direction === 'asc') {
      this.sortChange.emit({ field, direction: 'desc' });
      return;
    }
    this.sortChange.emit(null);
  }
}
