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
  loading = false; // Variável para controle do spinner

  constructor(
    private fb: FormBuilder,
    public authService: AuthenticationService,
    public router: Router
  ) {
    this.registerForm = this.fb.group({
      //name: ['', [Validators.required, Validators.minLength(5)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  ngOnInit() {}

  async register() {
    this.errorMessage = '';
    this.loading = true; // Ativa o spinner

    if (this.registerForm.valid) {
      const { email, password } = this.registerForm.value;

      try {
        // Cria a conta do usuário
        await this.authService.registerUser(email, password);

        // Envia e-mail de verificação
        await this.authService.sendVerificationMail();

        // Redireciona para a página de verificação
        this.router.navigate(['verify-email']);

        console.log('Registo realizado com sucesso!');
      } catch (error: any) {
        console.error('Erro ao registrar:', error);
        this.errorMessage = error.message;
        window.alert(error.message);
      } finally {
        this.loading = false; // 🔥 O spinner SEMPRE para, independentemente do resultado
      }
    } else {
      console.log('Formulário inválido');
      this.loading = false; // O spinner também deve parar se o formulário for inválido
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
    if (form.get(field)?.hasError('maxlength')) {
      return `A senha deve ter no máximo ${
        form.get(field)?.errors?.['maxlength'].requiredLength
      } caracteres.`;
    }
    if (form.get(field)?.hasError('pattern')) {
      return 'Formato inválido.';
    }
    return '';
  }
}
