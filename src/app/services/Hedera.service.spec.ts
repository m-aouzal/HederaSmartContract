/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { HederaService } from './hedera.service';

describe('Service: Hedera', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HederaService]
    });
  });

  it('should ...', inject([HederaService], (service: HederaService) => {
    expect(service).toBeTruthy();
  }));
});
