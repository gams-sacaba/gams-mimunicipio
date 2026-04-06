import { MediaMatcher } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import {
  Component,
  HostListener,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';

import { AuthService } from '../../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { SocketService } from '../../services/socket.service';
import { ModificarPasswordComponent } from '../layout/modificar-password/modificar-password.component';
import { getIncialesMayuscula } from '../../utils/utils';
import { SolicitudesService } from '../../services/solicitudes.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  accessibleModules$!: Observable<string[]>;
  mobileQuery: MediaQueryList;
  public activeLink: string = '';
  isAprobador: any = null;
  notificaciones: any[] = [];
  unreadCount: number = 0;
  countBandeja: number = 0;

  fillerNav = Array.from({ length: 50 }, (_, i) => `Nav Item ${i + 1}`);

  private _mobileQueryListener: () => void;
  showDropdown: boolean = false;
  constructor(
    private dialog: MatDialog,
    private authService: AuthService,
    private socketService: SocketService,
    private solicitudService: SolicitudesService,
    private elementRef: ElementRef,
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);

    this.accessibleModules$ = this.authService.getAccessibleModules();

    this.accessibleModules$.subscribe((mods) => {});

    this.socketService.solicitudUpdatedToUser$.subscribe((solicitud) => {
      if (solicitud) {
        this.agregarNotificacion(solicitud);
      }
    });

    this.cargarConteoInicial();

    this.socketService.solicitudUpdateToApprover$.subscribe((solicitud) => {
      if (!solicitud) return;

      this.cargarConteoInicial();
    });
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }
  logout() {
    this.authService.logout();
  }
  name() {
    const name = this.authService.getUserNameValue().toString();
    return getIncialesMayuscula(name);
  }

  formatName(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  }

  setActiveLink(link: string): void {
    this.activeLink = link;
  }

  getActiveLink(): string {
    return this.activeLink;
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  changePassword(): void {
    const dialogRef = this.dialog.open(ModificarPasswordComponent, {
      data: true,
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const userAccount =
      this.elementRef.nativeElement.querySelector('.user-account');

    if (userAccount && !userAccount.contains(event.target)) {
      this.showDropdown = false;
    }
  }

  agregarNotificacion(solicitud: any) {
    const mensaje = `Tu solicitud de ${solicitud.id_contenido?.titulo} ha cambiado a estado: ${solicitud.estado}`;
    this.notificaciones.unshift({
      mensaje,
      fecha: new Date(),
      leida: false,
      id: solicitud._id,
    });
    this.actualizarContador();
  }

  actualizarContador() {
    this.unreadCount = this.notificaciones.filter((n) => !n.leida).length;
  }

  marcarComoLeidas() {
    this.notificaciones.forEach((n) => (n.leida = true));
    this.actualizarContador();
  }

  async cargarConteoInicial() {
    const idCargo = this.authService.getIsAprobador();

    if (
      !idCargo ||
      idCargo === 'null' ||
      idCargo === 'undefined' ||
      idCargo.toString().trim() === ''
    ) {
      this.countBandeja = 0;
      return;
    }

    this.solicitudService
      .getFiltroElementos('id_cargo_aprobador', idCargo, 'bandeja')
      .subscribe({
        next: (data: any) => {
          this.countBandeja = data ? data.length : 0;
        },
        error: (err) => {
          console.error('Error en conteo bandeja:', err);
          this.countBandeja = 0;
        },
      });
  }
}
