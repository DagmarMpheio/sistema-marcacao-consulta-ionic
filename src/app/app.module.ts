import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Serviços do Firebase + modulo do ambiente
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { getStorage, provideStorage } from '@angular/fire/storage';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideFirebaseApp(() =>
      initializeApp({
        projectId: 'ionic-crud-f1177',
        appId: '1:675013963678:web:9e42acfb845f0bcc9af08f',
        databaseURL: 'https://ionic-crud-f1177-default-rtdb.firebaseio.com',
        storageBucket: 'ionic-crud-f1177.appspot.com',
        apiKey: 'AIzaSyBpWJt-p-Nq9CjHUK4bvNw3GuajeUIgDms',
        authDomain: 'ionic-crud-f1177.firebaseapp.com',
        messagingSenderId: '675013963678',
        measurementId: 'G-TT2Y85DQQT',
      })
    ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideDatabase(() => getDatabase()),
    provideStorage(() => getStorage()),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
