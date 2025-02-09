import { Component, OnInit } from '@angular/core';
import { Auth, updateProfile, User } from '@angular/fire/auth';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-update-profile',
  templateUrl: './update-profile.page.html',
  styleUrls: ['./update-profile.page.scss'],
  standalone: false,
})
export class UpdateProfilePage implements OnInit {
  profileForm!: FormGroup;
  message = ''; // Mensagem de sucesso
  loading = false; // Variável para controle do spinner

  constructor(private fb: FormBuilder, private auth: Auth) {}

  ngOnInit() {
    this.initForm();
    this.loadUserData();
  }

  // Inicializa o formulário
  initForm() {
    this.profileForm = this.fb.group({
      displayName: ['', Validators.required],
      photoURL: [''],
    });
  }

  // Carrega os dados atuais do usuário para preencher o formulário
  loadUserData() {
    const user: User | null = this.auth.currentUser;
    if (user) {
      this.profileForm.patchValue({
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
      });
    }
  }

  // Atualiza o perfil do usuário
  async updateProfile() {
    this.loading = true; // Activa o spinner

    if (this.profileForm.valid) {
      const { displayName, photoURL } = this.profileForm.value;
      const user: User | null = this.auth.currentUser;

      if (user) {
        try {
          await updateProfile(user, { displayName, photoURL });
          // actualizar os dados no localStorage
          const updatedUserData = {
            uid: user.uid,
            email: user.email || '',
            displayName,
            photoURL,
            emailVerified: user.emailVerified,
            isAdmin: JSON.parse(localStorage.getItem('isAdmin') || 'false'),
          };

          localStorage.setItem('user', JSON.stringify(updatedUserData));

          this.message = 'Perfil actualizado com sucesso!';
        } catch (error) {
          console.error('Erro ao actualizar perfil:', error);
        } finally {
          this.loading = false; //  O spinner SEMPRE para, independentemente do resultado
        }
      }
    }
  }
}
