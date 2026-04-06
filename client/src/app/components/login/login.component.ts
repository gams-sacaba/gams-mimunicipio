import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ModificarPasswordComponent } from '../layout/modificar-password/modificar-password.component';
import { MessageDialogComponent } from '../../../shared/components/message-dialog/message-dialog.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  role: number = 5;
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  rememberMe: boolean = false;
  expirationTimeout: any;
  hidePassword: boolean = true;
  constructor(
    private dialog: MatDialog,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const rememberedUsername = localStorage.getItem('rememberedUsername');
    if (rememberedUsername) {
      this.username = rememberedUsername;
      this.rememberMe = true;
    }
  }

  onSubmit() {
    if (!this.username || !this.password) {
      this.errorMessage = 'Por favor, complete todos los campos.';
      return;
    }

    this.authService
      .login({
        username: this.username.toUpperCase(),
        password: this.password,
        role: this.role,
      })
      .subscribe(
        (response: any) => {
          if (!response.success) {
            this.errorMessage = response.message;
            return;
          }
          this.authService.getAccessibleModules().subscribe((modules: any) => {
            if (modules && Object.keys(modules).length > 0) {
              if (this.rememberMe) {
                localStorage.setItem('rememberedUsername', this.username);
              } else {
                localStorage.removeItem('rememberedUsername');
              }

              let ci: string;
              let ext: string | undefined;

              [ci, ext] = this.username.split('-');

              if (!ext || ext.trim() === '') {
                ext = undefined;
              }

              const expectedPassword = ext ? `${ci}-${ext}` : ci;

              if (this.password === expectedPassword) {
                this.openModifyPassword();
              }

              const firstModule = Object.keys(modules)[0];
              this.router.navigate([`/${firstModule}`]);
            } else {
              this.errorMessage = 'No tiene acceso autorizado.';
            }
          });
        },
        (error: any) => {
          this.errorMessage = 'Error al conectar con el servidor.';
        },
      );
  }

  openModifyMessage() {
    this.password = '';
    const dialogRef = this.dialog.open(MessageDialogComponent, {
      width: '450px',
      data: {
        message:
          'Acceso Denegado!. Debe cambiar su contraseña ingresando al sistema MiMunicipio!',
      },
    });
    this.authService.logout();
  }

  showExpirationWarning(token: string) {}

  openModifyPassword() {
    this.password = '';
    const dialogRef = this.dialog.open(ModificarPasswordComponent, {
      disableClose: true,
      data: false,
    });

    dialogRef.afterClosed().subscribe(() => {
      this.authService.logout();
    });
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }
}
