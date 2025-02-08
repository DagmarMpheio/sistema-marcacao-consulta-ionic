import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'login-page',
    loadChildren: () => import('./auth/login-page/login-page.module').then( m => m.LoginPagePageModule)
  },
  {
    path: 'register-page',
    loadChildren: () => import('./auth/register-page/register-page.module').then( m => m.RegisterPagePageModule)
  },
  {
    path: 'verify-email-page',
    loadChildren: () => import('./auth/verify-email-page/verify-email-page.module').then( m => m.VerifyEmailPagePageModule)
  },
  {
    path: 'forget-password-page',
    loadChildren: () => import('./auth/forget-password-page/forget-password-page.module').then( m => m.ForgetPasswordPagePageModule)
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
