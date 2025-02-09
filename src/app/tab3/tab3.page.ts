import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
})
export class Tab3Page {
  constructor(
    private alertController: AlertController,
    public authService: AuthenticationService
  ) {}

  userData: any;

  ngOnInit() {
    // Obter o user no localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.userData = user;
  }

  async confirmSignOut() {
    const alert = await this.alertController.create({
      header: 'Confirmar Saída',
      message: 'Tem certeza de que deseja sair?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Sair',
          handler: () => {
            this.authService.signOut();
          },
        },
      ],
    });

    await alert.present();
  }
}
