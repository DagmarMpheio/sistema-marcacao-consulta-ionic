import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ForgetPasswordPagePage } from './forget-password-page.page';

const routes: Routes = [
  {
    path: '',
    component: ForgetPasswordPagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ForgetPasswordPagePageRoutingModule {}
