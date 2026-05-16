import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'prx-prescription-list',
  templateUrl: './prescription-list.component.html',
  styleUrl: './prescription-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrescriptionListComponent {}
