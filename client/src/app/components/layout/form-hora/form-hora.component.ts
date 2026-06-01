import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SolicitudesService } from '../../../services/solicitudes.service';
import { AuthService } from '../../../services/auth.service';

import { getIncialesMayuscula } from '../../../utils/utils';
import { RestriccionesService } from '../../../services/restricciones.service';

@Component({
  selector: 'app-form-hora',
  templateUrl: './form-hora.component.html',
  styleUrl: './form-hora.component.scss',
})
export class FormHoraComponent implements OnInit {
  _idRegistro: any;
  _idAprobador: any;
  _idRegistroAprobador: any;
  today: Date = new Date();
  fechaSalida: Date | null = null;
  horaInicio: string = '';
  horaFin: string = '';
  descripcion: string = '';
  horaRangoInvalido: boolean = false;
  esAprobador: boolean = false;
  esDetalle: boolean = false;
  esVista: boolean = false;
  estado: string = 'ENVIADO';
  estadoAprobador: string = '';

  modoEdicion: boolean = false;
  solicitudId: string | null = null;
  solicitud: any;
  observacion: string = '';
  restricciones: any;

  id_recursos_humanos: string = '695808c0a886da9f714a6945';
  RangoMinFecha = new Date(2026, 0, 1);
  RangoMaxFecha = new Date(2026, 11, 31);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<FormHoraComponent>,
    private authService: AuthService,
    private solicitudService: SolicitudesService,
    private restriccionService: RestriccionesService,
  ) {
    this._idRegistro = this.authService.getUserRegistro().toString();
    this._idAprobador = this.authService.getAprobador().toString();
  }

  ngOnInit(): void {
    this.esAprobador = this.data?.esAprobador ?? false;
    this.esDetalle = this.data?.esDetalle ?? false;
    this.esVista = this.data?.esVista ?? false;
    this.estadoAprobador = this.data?.estadoAprobador || 'PENDIENTE';
    this._idRegistroAprobador = this.data?._idRegistroAprobador;

    this.modoEdicion = this.data?.editar ?? false;

    if (this.modoEdicion && this.data?.id_contenido) {
      this.solicitud = this.data;
      this.estado = this.solicitud?.estado || 'ENVIADO';
      this.observacion = this.solicitud?.observacion || '';
      this.data = this.data.id_contenido;
      this.cargarDatosEdicion(this.solicitud);
    }
    this.restricciones = this.data.restricciones;
  }

  cargarDatosEdicion(solicitud: any): void {
    this.solicitudId = solicitud._id;
    this.fechaSalida = solicitud.fecha_inicio;
    this.horaInicio = solicitud.hora_inicio || '';
    this.horaFin = solicitud.hora_fin || '';
    this.descripcion = solicitud.detalle || '';
  }

  filtroFechasValidas = (fecha: Date | null): boolean => {
    if (!fecha) return false;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaSeleccionada = new Date(fecha);
    fechaSeleccionada.setHours(0, 0, 0, 0);

    if (this.modoEdicion && this.solicitud?.fecha_inicio) {
      const fOriginal = new Date(this.solicitud.fecha_inicio);
      fOriginal.setHours(0, 0, 0, 0);
      if (fechaSeleccionada.getTime() === fOriginal.getTime()) return true;
    }

    const aplicarDiasHabiles = this.restricciones?.dias_habiles ?? false;
    if (aplicarDiasHabiles) {
      const nroDiaSemana = fechaSeleccionada.getDay();
      if (nroDiaSemana === 0 || nroDiaSemana === 6) return false;
    }

    const esFestivo = this.restricciones?.dias_no_permitidos?.some(
      (f: any) =>
        new Date(f).toDateString() === fechaSeleccionada.toDateString(),
    );
    if (esFestivo) return false;

    const diaCierre = this.restricciones?.cierre_administrativo ?? 0;
    let fechaInicioPlanilla: Date | null = null;

    if (diaCierre > 0) {
      if (diaCierre >= 30) {
        fechaInicioPlanilla = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

        if (
          hoy.getDate() > diaCierre &&
          fechaSeleccionada.getMonth() === hoy.getMonth()
        )
          return false;
      } else {
        fechaInicioPlanilla =
          hoy.getDate() <= diaCierre
            ? new Date(hoy.getFullYear(), hoy.getMonth() - 1, diaCierre + 1)
            : new Date(hoy.getFullYear(), hoy.getMonth(), diaCierre + 1);
      }
      if (fechaSeleccionada < fechaInicioPlanilla) return false;
    }

    const plz = this.restricciones?.max_dias_plazo ?? 0;
    const ant = this.restricciones?.max_dias_anticipacion ?? 0;

    if (plz === 0 && ant === 0) {
      return this.estaEnRangoGestion(fechaSeleccionada);
    }

    if (plz > 0) {
      const fechaMinimaPermitida =
        this.restriccionService.obtenerFechaMinimaPermitida(
          hoy,
          plz,
          this.restricciones,
        );
      const limiteRealAtras =
        fechaInicioPlanilla && fechaMinimaPermitida < fechaInicioPlanilla
          ? fechaInicioPlanilla
          : fechaMinimaPermitida;
      if (fechaSeleccionada < limiteRealAtras) return false;
    } else if (plz < 0 && ant === 0) {
      if (fechaSeleccionada < hoy) return false;
    }

    if (ant > 0) {
      const fechaMinimaFutura =
        this.restriccionService.obtenerFechaMinimaFutura(
          hoy,
          ant,
          this.restricciones,
        );
      if (fechaSeleccionada < fechaMinimaFutura) return false;
    } else if (ant < 0) {
      const diasHaciaFuturo = Math.abs(ant);
      const fechaMaximaFutura =
        this.restriccionService.obtenerFechaMinimaFutura(
          hoy,
          diasHaciaFuturo,
          this.restricciones,
        );
      if (fechaSeleccionada > fechaMaximaFutura) return false;
    } else if (ant === 0 && plz > 0) {
      if (fechaSeleccionada > hoy) return false;
    } else if (ant === 0 && plz < 0) {
      return true;
    }

    return this.estaEnRangoGestion(fechaSeleccionada);
  };

  private estaEnRangoGestion(fecha: Date): boolean {
    return fecha >= this.RangoMinFecha && fecha <= this.RangoMaxFecha;
  }

  validateHoraRango(): void {
    if (this.horaInicio && this.horaFin) {
      this.horaRangoInvalido = this.horaInicio >= this.horaFin;
    } else {
      this.horaRangoInvalido = false;
    }
  }

  enviarExcepcion(): void {
    if (this.fechaFueraDeRango()) {
      return;
    }

    if (
      !this.horaRangoInvalido &&
      this.fechaSalida &&
      this.horaInicio &&
      this.horaFin
    ) {
      const payload = {
        dias: [],
        gestion: new Date(),
        dias_totales: 0,
        fecha_inicio: this.fechaSalida,
        fecha_fin: this.fechaSalida,
        hora_inicio: this.horaInicio,
        hora_fin: this.horaFin,
        detalle: this.descripcion,
        observacion: this.observacion,
        id_registro: this._idRegistro,
        id_contenido: this.data?._id,
        id_cargo_aprobador: this._idAprobador,
        fecha_envio: this.data?.solicitud?.fecha_envio || new Date(),
        estado: this.obtenerEstadoConfirmado(),
        esAprobador: this.esAprobador,
        nuevo_historial: null as any,
      };

      if (this.esAprobador) {
        payload.nuevo_historial = {
          id_registro: this._idRegistroAprobador,
          decision: this.estado,
          fecha: new Date(),
        };
      }

      if (this.modoEdicion && this.solicitudId) {
        this.solicitudService
          .updateSolicitud(this.solicitudId, payload)
          .subscribe({
            next: (response) => {
              this.dialogRef.close(response);
            },
            error: (err) => console.error(),
          });
      } else {
        this.solicitudService.addSolicitud(payload).subscribe({
          next: (response) => this.dialogRef.close(response),
          error: (err) => console.error(),
        });
      }
    }
  }
  obtenerEstadoConfirmado() {
    if (this.estado === 'DENEGADO') return 'DENEGADO';
    if (this._idAprobador === this.id_recursos_humanos) return 'PENDIENTE';
    return this.estado || 'ENVIADO';
  }

  setAction(action: 'APROBAR' | 'RECHAZO'): void {}

  capitalizeFirst(text: string): string {
    return getIncialesMayuscula(text);
  }

  fechaFueraDeRango(): boolean {
    if (!this.fechaSalida) return true;

    return (
      this.fechaSalida < this.RangoMinFecha ||
      this.fechaSalida > this.RangoMaxFecha
    );
  }

  observacionInvalida(): boolean {
    if (this.estado === 'RECHAZADO' || this.estado === 'DENEGADO') {
      return !this.observacion || this.observacion.trim().length < 5;
    }
    return false;
  }

  salir(): void {
    this.dialogRef.close();
  }
}
