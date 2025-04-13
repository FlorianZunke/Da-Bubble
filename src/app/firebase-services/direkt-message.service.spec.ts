import { TestBed } from '@angular/core/testing';

import { DirektMessageService } from './direkt-message.service';

describe('DirektMessageService', () => {
  let service: DirektMessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DirektMessageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
