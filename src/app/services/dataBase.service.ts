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
import {
  addDoc,
  getDocs,
  getDocsFromCache,
  getDocsFromServer,
} from 'firebase/firestore';
import { Observable, from } from 'rxjs';
import { Account } from '../Interfaces/Account';
import { Token } from '../Interfaces/Token';
import { MyFavorites } from '../Interfaces/MyFavorites';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class DataBaseService {
  constructor() {}
  fireStore = inject(Firestore);
  authService = inject(AuthService);
  accounts = collection(this.fireStore, 'accounts');
  tokens = collection(this.fireStore, 'tokens');
  favoritesCollection = collection(this.fireStore, 'favorites');

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
      alias: account.alias,
    };

    const promise = new Promise<string>((resolve, reject) => {
      this.authService
        .signup(account.alias, account.email, account.password)
        .subscribe({
          next: () => {
            addDoc(this.accounts, accountToAdd).then(
              (response) => {
                console.log('Account added with ID:', response.id);
                resolve(response.id);
              },
              (err) => {
                console.error('Error adding account to database:', err);
                reject(err);
              }
            );
          },
          error: (err) => {
            console.error('Error signing up user:', err);
            reject(err);
          },
        });
    });

    return from(promise);
  }

  addFavorite(favorite: MyFavorites): Observable<string> {
    const favoriteToAdd = {
      registerer: favorite.registerer,
      accountId: favorite.accountId,
      alias: favorite.alias,
    };

    const promise = new Promise<string>((resolve, reject) => {
      addDoc(this.favoritesCollection, favoriteToAdd).then(
        (response) => {
          console.log('Favorite added with ID:', response.id);
          resolve(response.id);
        },
        (err) => {
          console.error('Error adding favorite to database:', err);
          reject(err);
        }
      );
    });

    return from(promise);
  }

  getMyFavorites(email: string): Observable<MyFavorites[]> {
    const q = query(this.favoritesCollection, where('registerer', '==', email));
    const promise = getDocs(q).then((snapshot) => {
      return snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as MyFavorites)
      );
    });
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
  removeFavorite(favoriteId: string): Observable<void> {
    const docRef = doc(this.fireStore, `favorites/${favoriteId}`);
    const promise = deleteDoc(docRef);
    return from(promise);
  }

  getTokens(): Observable<Token[]> {
    return collectionData(this.tokens, { idField: 'id' }) as Observable<
      Token[]
    >;
  }
}
