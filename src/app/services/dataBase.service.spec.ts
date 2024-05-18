/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { DataBaseService } from './dataBase.service';

describe('Service: DataBase', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DataBaseService]
    });
  });

  it('should ...', inject([DataBaseService], (service: DataBaseService) => {
    expect(service).toBeTruthy();
  }));
});
