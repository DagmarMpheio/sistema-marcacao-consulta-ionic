import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from './services/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) {}

  ngOnInit() {
    //Garantir que Usuário Autenticado Não Veja a Tela de Login
    if (this.authService.isLoggedIn) {
      if (this.authService.isUserAdmin) {
        this.router.navigate(['/dashboard']); //  Se estiver auntenticado e se for admin, vai direto para as dashboard
      } else {
        this.router.navigate(['/tabs'], { replaceUrl: true }); //  Se estiver auntenticado e se nao for admin, vai direto para as Tabs
      }
    } else {
      this.router.navigate(['/login'], { replaceUrl: true }); //  Senão, vai para o Login
    }
  }
}
