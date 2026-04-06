import { TestBed } from '@angular/core/testing';

import { DependenciasService } from './dependencias.service';

describe('DependenciasService', () => {
  let service: DependenciasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DependenciasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
