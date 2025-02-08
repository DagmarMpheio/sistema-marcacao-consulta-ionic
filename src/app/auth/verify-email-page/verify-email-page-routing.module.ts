import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VerifyEmailPagePage } from './verify-email-page.page';

const routes: Routes = [
  {
    path: '',
    component: VerifyEmailPagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VerifyEmailPagePageRoutingModule {}
