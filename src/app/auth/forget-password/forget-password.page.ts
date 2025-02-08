import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.page.html',
  styleUrls: ['./forget-password.page.scss'],
  standalone: false,
})
export class ForgetPasswordPage implements OnInit {
  forgetPasswordForm!: FormGroup;
  errorMessage: string = ''; // 🔥 Armazena a mensagem de erro

  constructor(
    private fb: FormBuilder,
    public authService: AuthenticationService,
    public router: Router
  ) {}

  ngOnInit() {
    this.forgetPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  async resetPassword() {
    this.errorMessage = ''; // 🔥 Resetar erro antes de tentar login
    if (this.forgetPasswordForm.valid) {
      const { email } = this.forgetPasswordForm.value;
      try {
        await this.authService
          .passwordRecover(email.value)
          .then((): any => {
            window.alert('Verifique a sua caixa de entrada.');
          })
          .catch((error) => {
            window.alert(error.message);
          });
      } catch (error: any) {
        alert(error.message);
        this.errorMessage = error.message; // 🔥 Exibir erro
      }
    } else {
      console.log('Formulário inválido');
    }
  }

  getErrorMessage(form: FormGroup, field: string): string {
    if (form.get(field)?.hasError('required')) {
      return 'Este campo é obrigatório.';
    }
    if (form.get(field)?.hasError('email')) {
      return 'Digite um e-mail válido.';
    }
    if (form.get(field)?.hasError('minlength')) {
      return `A senha deve ter pelo menos ${
        form.get(field)?.errors?.['minlength'].requiredLength
      } caracteres.`;
    }
    if (form.get(field)?.hasError('pattern')) {
      return 'Formato inválido.';
    }
    return '';
  }
}
