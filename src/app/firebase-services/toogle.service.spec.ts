import { TestBed } from '@angular/core/testing';

import { ToogleService } from './toogle.service';

describe('ToogleService', () => {
  let service: ToogleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToogleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
