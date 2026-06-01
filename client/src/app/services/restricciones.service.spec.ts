import { TestBed } from '@angular/core/testing';

import { RestriccionesService } from './restricciones.service';

describe('RestriccionesService', () => {
  let service: RestriccionesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RestriccionesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
