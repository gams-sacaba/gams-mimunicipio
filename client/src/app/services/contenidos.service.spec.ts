import { TestBed } from '@angular/core/testing';

import { ContenidosService } from './contenidos.service';

describe('ContenidosService', () => {
  let service: ContenidosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContenidosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
