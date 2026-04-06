import { TestBed } from '@angular/core/testing';

import { BandejaService } from './bandeja.service';

describe('BandejaService', () => {
  let service: BandejaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BandejaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
