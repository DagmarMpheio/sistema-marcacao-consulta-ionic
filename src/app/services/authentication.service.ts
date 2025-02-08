import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
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
      this.auth.onAuthStateChanged((user) => {
        if (user) {
          // Obtém os dados do usuário no Firestore usando o UID
          this.getUserDataByUserId(user.uid).subscribe((userData) => {
            // Verifica se o usuário é administrador (valor padrão: false)
            const isAdmin = userData?.isAdmin || false;

            // Cria um objeto com apenas os campos necessários para evitar conflitos de tipo
            const userObj: User = {
              uid: user.uid, // Identificador único do usuário
              email: user.email || '', // Email do usuário (garante que seja string)
              displayName: user.displayName || '', // Nome de exibição
              photoURL: user.photoURL || '', // URL da foto de perfil
              emailVerified: user.emailVerified, // Indica se o email foi verificado
              isAdmin: isAdmin, // Define o status de administrador
            };

            // Armazena os dados do usuário no localStorage para persistência da sessão
            localStorage.setItem('isAdmin', JSON.stringify(isAdmin));
            localStorage.setItem('user', JSON.stringify(userObj));

            // Emite o usuário actualizado para os observadores
            observer.next(userObj);
          });
        } else {
          // Se o usuário não estiver autenticado, remove os dados do localStorage
          localStorage.removeItem('user');
          localStorage.removeItem('isAdmin');

          // Emite null indicando que não há usuário autenticado
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
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return user?.emailVerified ?? false;
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
      const userData = await this.getUserDataByUserId(
        result.user.uid
      ).toPromise();
      this.setUserData(result.user, userData?.isAdmin || false);
    } catch (error: any) {
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

      // Actualiza o perfil do usuário com o displayName
      await this.updateUserProfile(displayName, '');

      // Salva os dados do usuário no Firestore ou outro banco
      await this.setUserData(result.user, false);

      // Envia o e-mail de verificação
      await this.sendVerificationMail();
    } catch (error: any) {
      console.error(
        'Erro ao registrar usuário:',
        this.handleFirebaseError(error)
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
      default:
        return 'Ocorreu um erro. Tente novamente.';
    }
  }
}
