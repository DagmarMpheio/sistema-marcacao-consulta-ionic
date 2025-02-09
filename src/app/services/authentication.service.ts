import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Firebase
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
  onAuthStateChanged,
  updateProfile,
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, docData } from '@angular/fire/firestore';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  user$: Observable<User | null>;

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router
  ) {
    this.user$ = this.authState();
  }

  private authState(): Observable<User | null> {
    return new Observable<User | null>((observer) => {
      // Monitora mudanças no estado de autenticação do Firebase
      this.auth.onAuthStateChanged(async (user) => {
        if (user) {
          try {
            // Obtém os dados do usuário no Firestore usando firstValueFrom()
            const userData = await firstValueFrom(
              this.getUserDataByUserId(user.uid)
            );

            // Exibir os dados no console
            console.log('Dados do usuário:', userData);

            // Verifica se o usuário é administrador (valor padrão: false)
            const isAdmin = userData?.isAdmin || false;

            // Cria um objeto com os campos necessários
            const userObj: User = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || '',
              photoURL: user.photoURL || '',
              emailVerified: user.emailVerified,
              isAdmin: isAdmin,
            };

            // Armazena os dados no localStorage
            localStorage.setItem('isAdmin', JSON.stringify(isAdmin));
            localStorage.setItem('user', JSON.stringify(userObj));

            // Emite o usuário atualizado
            observer.next(userObj);
          } catch (error) {
            console.error('Erro ao obter dados do usuário:', error);
            observer.next(null);
          }
        } else {
          // Se não houver usuário autenticado, limpa o localStorage
          localStorage.removeItem('user');
          localStorage.removeItem('isAdmin');

          // Emite null
          observer.next(null);
        }
      });
    });
  }

  // Retorna verdadeiro se o usuário está autenticado
  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return user !== null;
  }

  // Retorna verdadeiro se o e-mail do usuário foi verificado
  get isEmailVerified(): boolean {
    return this.auth.currentUser?.emailVerified ?? false;
  }

  // Retorna verdadeiro se o usuário for administrador
  get isUserAdmin(): boolean {
    return JSON.parse(localStorage.getItem('isAdmin') || 'false');
  }

  // Login com e-mail e senha
  async signIn(email: string, password: string): Promise<void> {
    try {
      const result = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );

      // Obtendo os dados do usuário usando firstValueFrom
      const userData = await firstValueFrom(
        this.getUserDataByUserId(result.user.uid)
      );

      let isAdmin = userData?.isAdmin || false;

      // Definir os dados do usuário
      this.setUserData(result.user, isAdmin);

      // Exibir os dados no console
      //console.log('Dados do usuário:', userData);
    } catch (error) {
      console.error('Erro ao fazer login:', this.handleFirebaseError(error));
      throw new Error(this.handleFirebaseError(error));
    }
  }

  // Registro de novo usuário
  async registerUser(
    email: string,
    password: string,
    displayName: string
  ): Promise<void> {
    try {
      const result = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );

      // Actualizar o nome de exibição do usuário
      await updateProfile(result.user, {
        displayName: displayName
      });

      // Salva os dados do usuário no Firestore ou outro banco
      await this.setUserData(result.user, false);
    } catch (error: any) {
      console.error(
        'Erro ao registrar usuário:',
        error
        /* this.handleFirebaseError(error) */
      );
      throw new Error(this.handleFirebaseError(error));
    }
  }

  // Enviar e-mail de verificação
  async sendVerificationMail(): Promise<void> {
    const user = this.auth.currentUser;
    if (user) {
      await sendEmailVerification(user);
      this.router.navigate(['verify-email']);
    }
  }

  // Recuperação de senha
  async passwordRecover(passwordResetEmail: string): Promise<void> {
    try {
      //const authInstance = this.ngFireAuth; // Obtém a instância de autenticação
      await sendPasswordResetEmail(this.auth, passwordResetEmail);
      alert('O e-mail de redefinição de senha foi enviado.');
    } catch (error: any) {
      console.error('Erro ao enviar e-mail de recuperação:', error);
      alert(error.message);
    }
  }

  // Login com Google
  async GoogleAuth(): Promise<void> {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      const userData = await this.getUserDataByUserId(
        result.user.uid
      ).toPromise();
      await this.setUserData(result.user, userData?.isAdmin || false);
      this.router.navigate(userData?.isAdmin ? ['/dashboard'] : ['/']);
    } catch (error) {
      console.error('Erro ao autenticar com Google:', error);
    }
  }

  // Armazena os dados do usuário no Firestore
  async setUserData(user: FirebaseUser, isAdmin: boolean): Promise<void> {
    const userRef = doc(this.firestore, `users/${user.uid}`);
    const userData: User = {
      uid: user.uid,
      email: user.email!,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      emailVerified: user.emailVerified,
      isAdmin,
    };
    await setDoc(userRef, userData, { merge: true });
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('isAdmin', JSON.stringify(isAdmin));
  }

  // Obter os dados do usuário pelo ID
  getUserDataByUserId(userId: string): Observable<User | null> {
    const userRef = doc(this.firestore, `users/${userId}`);
    return docData(userRef).pipe(map((data) => (data ? (data as User) : null)));
  }

  // Actualizar perfil do usuário
  async updateUserProfile(
    displayName: string,
    photoURL: string
  ): Promise<void> {
    const user = this.auth.currentUser;
    if (user) {
      await this.updateUserData({ displayName, photoURL });
    } else {
      throw new Error('Usuário não autenticado.');
    }
  }

  // Actualizar dados do usuário no Firestore
  async updateUserData(userData: Partial<User>): Promise<void> {
    const user = this.auth.currentUser;
    if (user) {
      const userRef = doc(this.firestore, `users/${user.uid}`);
      await setDoc(userRef, userData, { merge: true });
    }
  }

  // Logout
  async signOut(): Promise<void> {
    await signOut(this.auth);
    localStorage.removeItem('user');
    localStorage.removeItem('isAdmin');
    this.router.navigate(['login']);
  }

  handleFirebaseError(error: any): string {
    switch (error.code) {
      case 'auth/invalid-email':
        return 'O e-mail inserido é inválido.';
      case 'auth/user-not-found':
        return 'Usuário não encontrado.';
      case 'auth/wrong-password':
        return 'Senha incorreta.';
      case 'auth/email-already-in-use':
        return 'Este e-mail já está cadastrado.';
      case 'auth/weak-password':
        return 'A senha deve ter pelo menos 6 caracteres.';
      case 'auth/admin-restricted-operation':
        return 'Você está tentando realizar uma operação que exige privilégios administrativos ou o método de autenticação não está Activado no Firebase Console.';
      case 'auth/missing-email':
        return 'Email em falta.';
      default:
        return 'Ocorreu um erro. Tente novamente.';
    }
  }
}
