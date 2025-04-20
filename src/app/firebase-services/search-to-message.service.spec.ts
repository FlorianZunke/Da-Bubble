import { TestBed } from '@angular/core/testing';

import { SearchToMessageService } from './search-to-message.service';

describe('SearchToMessageService', () => {
  let service: SearchToMessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchToMessageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
