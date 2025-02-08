import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VerifyEmailPagePageRoutingModule } from './verify-email-page-routing.module';

import { VerifyEmailPagePage } from './verify-email-page.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VerifyEmailPagePageRoutingModule
  ],
  declarations: [VerifyEmailPagePage]
})
export class VerifyEmailPagePageModule {}
