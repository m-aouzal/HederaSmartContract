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
import { Token } from './Token'; // Add this import

@Injectable({
  providedIn: 'root',
})
export class DataBaseService {
  constructor() {}
  fireStore = inject(Firestore);
  accounts = collection(this.fireStore, 'accounts');
  tokens = collection(this.fireStore, 'tokens'); // Add this line

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
        (doc) => ({ id: doc.id, ...doc.data() } as Account)
      );
    });
    return from(promise);
  }

  removeAccount(accountId: string): Observable<void> {
    const docRef = doc(this.fireStore, `accounts/${accountId}`);
    const promise = deleteDoc(docRef);
    return from(promise);
  }

  // Add these methods for handling tokens
  getTokens(): Observable<Token[]> {
    return collectionData(this.tokens, { idField: 'id' }) as Observable<
      Token[]
    >;
  }

  addToken(token: Token): Observable<string> {
    const tokenToAdd = {
      tokenName: token.tokenName,
      tokenSymbol: token.tokenSymbol,
      tokenId: token.tokenId,
    };
    const promise = addDoc(this.tokens, tokenToAdd).then(
      (response) => response.id
    );
    return from(promise);
  }

  removeToken(tokenId: string): Observable<void> {
    const docRef = doc(this.fireStore, `tokens/${tokenId}`);
    const promise = deleteDoc(docRef);
    return from(promise);
  }
}
