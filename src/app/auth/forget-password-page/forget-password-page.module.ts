import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ForgetPasswordPagePageRoutingModule } from './forget-password-page-routing.module';

import { ForgetPasswordPagePage } from './forget-password-page.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ForgetPasswordPagePageRoutingModule
  ],
  declarations: [ForgetPasswordPagePage]
})
export class ForgetPasswordPagePageModule {}
