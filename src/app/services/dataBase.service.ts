import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collectionData,
  query,
  where,
  doc,
  deleteDoc,
  collection,
} from '@angular/fire/firestore';
import { addDoc, getDocs } from 'firebase/firestore';
import { Observable, from } from 'rxjs';
import { Account } from './Account';

@Injectable({
  providedIn: 'root',
})
export class DataBaseService {
  constructor() {}
  fireStore = inject(Firestore);
  accounts = collection(this.fireStore, 'accounts');

  getAccounts(): Observable<Account[]> {
    return collectionData(this.accounts, { idField: 'id' }) as Observable<
      Account[]
    >;
  }

  addAccount(account: Account): Observable<string> {
    const accountToAdd = {
      accountId: account.accountId,
      accountPrivateKey: account.accountPrivateKey,
      email: account.email,
    };
    const promise = addDoc(this.accounts, accountToAdd).then(
      (response) => response.id
    );
    return from(promise);
  }

  getAccountByEmail(email: string): Observable<Account[]> {
    const q = query(this.accounts, where('email', '==', email));
    const promise = getDocs(q).then((snapshot) => {
      return snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as unknown as Account)
      );
    });
    return from(promise);
  }

  removeAccount(docId: string): Observable<void> {
    const docRef = doc(this.fireStore, `accounts/${docId}`);
    const promise = deleteDoc(docRef);
    return from(promise);
  }
}
