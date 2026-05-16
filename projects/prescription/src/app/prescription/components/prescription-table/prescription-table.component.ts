import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';

import type { Prescription } from '../../models/prescription.model';
import type {
  PrescriptionSort,
  PrescriptionSortDirection,
  PrescriptionSortField,
} from '../../models/prescription-query.model';

interface ColumnDef {
  readonly field: PrescriptionSortField;
  readonly label: string;
  readonly type: 'text' | 'date';
}

const COLUMNS: ReadonlyArray<ColumnDef> = [
  { field: 'medicationName', label: 'Medication name', type: 'text' },
  { field: 'insurantName', label: 'Insurant name', type: 'text' },
  { field: 'insurantBirthDate', label: 'Insurant birth date', type: 'date' },
  { field: 'insurantId', label: 'Insurant id', type: 'text' },
  { field: 'prescriptionDate', label: 'Prescription date', type: 'date' },
];

@Component({
  selector: 'prx-prescription-table',
  imports: [DatePipe],
  templateUrl: './prescription-table.component.html',
  styleUrl: './prescription-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrescriptionTableComponent {
  readonly items = input.required<ReadonlyArray<Prescription>>();
  readonly sort = input<PrescriptionSort | null>(null);

  readonly sortChange = output<PrescriptionSort | null>();

  protected readonly columns = COLUMNS;

  protected directionFor(field: PrescriptionSortField): PrescriptionSortDirection | null {
    const current = this.sort();
    if (!current || current.field !== field) {
      return null;
    }
    return current.direction;
  }

  protected ariaSortFor(field: PrescriptionSortField): 'ascending' | 'descending' | 'none' {
    const direction = this.directionFor(field);
    if (direction === 'asc') {
      return 'ascending';
    }
    if (direction === 'desc') {
      return 'descending';
    }
    return 'none';
  }

  protected onHeaderClick(field: PrescriptionSortField): void {
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

  protected trackById(_index: number, item: Prescription): string {
    return item.id;
  }
}
