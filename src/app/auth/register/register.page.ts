import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false,
})
export class RegisterPage implements OnInit {
  registerForm!: FormGroup;
  errorMessage: string = ''; // 🔥 Armazena a mensagem de erro

  constructor(
    private fb: FormBuilder,
    public authService: AuthenticationService,
    public router: Router
  ) {}

  ngOnInit() {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(5)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  async register() {
    this.errorMessage = ''; // 🔥 Resetar erro antes de tentar register
    if (this.registerForm.valid) {
      const { name, email, password } = this.registerForm.value;
      try {
        await this.authService
          .registerUser(email.value, password.value, name.value)
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
