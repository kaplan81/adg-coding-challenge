import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import type { PrescriptionSortDirectionET } from '../../enums/prescription-sort-direction.enum';
import type { PrescriptionSortFieldET } from '../../enums/prescription-sort-field.enum';
import type { PrescriptionSort } from '../../models/prescription-query.model';
import type { Prescription } from '../../models/prescription.model';

@Component({
  selector: 'prx-prescription-table',
  imports: [DatePipe],
  templateUrl: './prescription-table.component.html',
  styleUrl: './prescription-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrescriptionTableComponent {
  static readonly tableColumns: ReadonlyArray<{
    field: PrescriptionSortFieldET;
    label: string;
    type: 'text' | 'date';
  }> = [
    { field: 'medicationName', label: 'Medication name', type: 'text' },
    { field: 'insurantName', label: 'Insurant name', type: 'text' },
    { field: 'insurantBirthDate', label: 'Insurant birth date', type: 'date' },
    { field: 'insurantId', label: 'Insurant id', type: 'text' },
    { field: 'prescriptionDate', label: 'Prescription date', type: 'date' },
  ];

  columns = PrescriptionTableComponent.tableColumns;
  items = input.required<ReadonlyArray<Prescription>>();
  sort = input<PrescriptionSort | null>(null);
  sortChange = output<PrescriptionSort | null>();

  ariaSortFor(field: PrescriptionSortFieldET): 'ascending' | 'descending' | 'none' {
    const direction = this.directionFor(field);
    if (direction === 'asc') {
      return 'ascending';
    }
    if (direction === 'desc') {
      return 'descending';
    }
    return 'none';
  }

  directionFor(field: PrescriptionSortFieldET): PrescriptionSortDirectionET | null {
    const current = this.sort();
    if (!current || current.field !== field) {
      return null;
    }
    return current.direction;
  }

  onHeaderClick(field: PrescriptionSortFieldET): void {
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
