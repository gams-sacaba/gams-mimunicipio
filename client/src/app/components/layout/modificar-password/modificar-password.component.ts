import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AbstractControl, ValidatorFn } from '@angular/forms';

@Component({
  selector: 'app-modificar-password',
  templateUrl: './modificar-password.component.html',
  styleUrls: ['./modificar-password.component.scss'],
})
export class ModificarPasswordComponent implements OnInit {
  passwordForm!: FormGroup;
  id_funcionario: any;
  notification = { message: '', type: '' };
  hideCurrentPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;

  private notificationQueue: {
    message: string;
    type: string;
    duration: number;
  }[] = [];
  private isNotificationVisible = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ModificarPasswordComponent>,
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.id_funcionario = this.authService.getUserFuncionario().toString();
  }

  ngOnInit(): void {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          this.sameAsCurrentPassword.bind(this),
          this.invalidPasswordFormat.bind(this),
        ],
      ],
      confirmPassword: ['', Validators.required],
    });
  }

  mostrarNotificacion(
    message: string,
    type: 'success' | 'error' | 'info',
    duration = 3000,
    callback?: () => void,
  ): void {
    this.notificationQueue.push({ message, type, duration });

    if (!this.isNotificationVisible) {
      this.processQueue(callback);
    }
  }

  private processQueue(callback?: () => void): void {
    if (this.notificationQueue.length === 0) {
      this.isNotificationVisible = false;

      if (callback) {
        callback();
      }
      return;
    }

    const { message, type, duration } = this.notificationQueue.shift()!;
    this.notification.message = message;
    this.notification.type = type;
    this.isNotificationVisible = true;

    setTimeout(() => {
      this.notification.message = '';
      this.isNotificationVisible = false;
      this.processQueue(callback);
    }, duration);
  }
  getNewPasswordErrorMessage(): string | null {
    const control = this.passwordForm.get('newPassword');

    if (control?.touched || control?.dirty) {
      if (control?.hasError('required')) {
        return 'Este campo es requerido.';
      }
      if (control?.hasError('minlength')) {
        return 'La contraseña debe tener al menos 6 caracteres.';
      }
      if (control?.hasError('sameAsCurrent')) {
        return 'La nueva contraseña no debe ser igual a la actual.';
      }

      if (control?.hasError('invalidFormat')) {
        return 'Debe contener al menos una letra, un número y un carácter especial (ej: . , - @ #).';
      }
    }

    return null;
  }

  sameAsCurrentPassword(
    control: AbstractControl,
  ): { [key: string]: boolean } | null {
    const passwordForm = control?.parent as FormGroup;
    if (passwordForm) {
      const currentPassword = passwordForm.get('currentPassword')?.value;
      if (control.value === currentPassword) {
        return { sameAsCurrent: true };
      }
    }
    return null;
  }

  invalidPasswordFormat(
    control: AbstractControl,
  ): { [key: string]: boolean } | null {
    const regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;

    if (control.value && !regex.test(control.value)) {
      return { invalidFormat: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.passwordForm.invalid) {
      this.mostrarNotificacion(
        'Corrige los errores antes de continuar.',
        'info',
      );
      return;
    }
    if (
      this.passwordForm.value.newPassword !==
      this.passwordForm.value.confirmPassword
    ) {
      this.mostrarNotificacion(
        'Las contraseñas no coinciden.',
        'error',
        2000,
        () => {
          this.passwordForm.reset();
        },
      );
      return;
    }

    const payload = {
      id: this.id_funcionario,
      currentPassword: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword,
    };

    this.authService.changePassword(payload).subscribe(
      (response: any) => {
        if (!response.success) {
          this.mostrarNotificacion(response.message, 'error', 2000, () => {
            this.passwordForm.reset();
          });
        } else {
          this.mostrarNotificacion(
            response.message + ' Cerrando Sesión...',
            'success',
            2000,
            () => {
              this.logout();
            },
          );
        }
      },
      () => {
        this.mostrarNotificacion('Error al conectar con el servidor', 'error');
      },
    );
  }

  toggleCurrentPassword() {
    this.hideCurrentPassword = !this.hideCurrentPassword;
  }

  toggleNewPassword() {
    this.hideNewPassword = !this.hideNewPassword;
  }

  toggleConfirmPassword() {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  logout(): void {
    this.dialogRef.close();
    this.authService.logout();
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 500);
  }
}
