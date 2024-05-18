import { Injectable, inject } from '@angular/core';
import { Firestore, collectionData } from '@angular/fire/firestore';
import { collection } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { Account } from './Account';
@Injectable({
  providedIn: 'root'
})
export class DataBaseService {

constructor() { }
  fireStore = inject(Firestore);
  accountsId = collection(this.fireStore, 'accounts');

  getAccounts() :Observable<Account[]>{
    return collectionData(this.accountsId, {idField: 'id'}) as Observable<Account[]>;

  }
}
