import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string = ''; // 🔥 Armazena a mensagem de erro

  constructor(
    private fb: FormBuilder,
    public authService: AuthenticationService,
    public router: Router
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  async login() {
    this.errorMessage = ''; // 🔥 Resetar erro antes de tentar login
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      try {
        await this.authService
          .signIn(email.value, password.value)
          .then((): any => {
            if (this.authService.isEmailVerified) {
              if (this.authService.isUserAdmin) {
                this.router.navigate(['dashboard']);
              } else {
                this.router.navigate(['home']);
              }
            } else {
              window.alert('Email não verificado');
              return false;
            }
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
