import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import type { PrescriptionPage } from '../../models/prescription-page.model';
import type { PrescriptionQuery } from '../../models/prescription-query.model';

const ENDPOINT = '/api/prescriptions';

@Injectable()
export class PrescriptionService {
  #http = inject(HttpClient);

  search(query: PrescriptionQuery): Observable<PrescriptionPage> {
    let params = new HttpParams()
      .set('page', String(query.page))
      .set('pageSize', String(query.pageSize));

    if (query.q) {
      params = params.set('q', query.q);
    }
    if (query.medication) {
      params = params.set('medication', query.medication);
    }
    if (query.insurantId) {
      params = params.set('insurantId', query.insurantId);
    }
    if (query.sort) {
      params = params.set('sort', `${query.sort.field}:${query.sort.direction}`);
    }

    return this.#http.get<PrescriptionPage>(ENDPOINT, { params });
  }
}
