import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
const firebaseConfig = {
  apiKey: 'AIzaSyDLsVB0EtrGzpNCEUga9RnnzM93olJpek0',
  authDomain: 'hederarewarddistribution.firebaseapp.com',
  databaseURL:
    'https://hederarewarddistribution-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'hederarewarddistribution',
  storageBucket: 'hederarewarddistribution.appspot.com',
  messagingSenderId: '1007886719824',
  appId: '1:1007886719824:web:5730274d0883e2b4a9aa55',
  measurementId: 'G-0YXDC93X6C',
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()), provideFirebaseApp(() => initializeApp({"projectId":"hederarewarddistribution","appId":"1:1007886719824:web:5730274d0883e2b4a9aa55","databaseURL":"https://hederarewarddistribution-default-rtdb.europe-west1.firebasedatabase.app","storageBucket":"hederarewarddistribution.appspot.com","apiKey":"AIzaSyDLsVB0EtrGzpNCEUga9RnnzM93olJpek0","authDomain":"hederarewarddistribution.firebaseapp.com","messagingSenderId":"1007886719824","measurementId":"G-0YXDC93X6C"})), provideAuth(() => getAuth()), provideDatabase(() => getDatabase()), provideFirebaseApp(() => initializeApp({"projectId":"hederarewarddistribution","appId":"1:1007886719824:web:5730274d0883e2b4a9aa55","databaseURL":"https://hederarewarddistribution-default-rtdb.europe-west1.firebasedatabase.app","storageBucket":"hederarewarddistribution.appspot.com","apiKey":"AIzaSyDLsVB0EtrGzpNCEUga9RnnzM93olJpek0","authDomain":"hederarewarddistribution.firebaseapp.com","messagingSenderId":"1007886719824","measurementId":"G-0YXDC93X6C"})), provideAuth(() => getAuth()), provideDatabase(() => getDatabase()),
  ],
};