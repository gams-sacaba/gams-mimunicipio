import { Component, Inject } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { ModalVacacionComponent } from '../../content/modal-vacacion/modal-vacacion.component';
import { SolicitudesService } from '../../../services/solicitudes.service';
import { ModalReemplazoComponent } from '../../content/modal-reemplazo/modal-reemplazo.component';
import { AuthService } from '../../../services/auth.service';
import { convertToTimezone, getIncialesMayuscula } from '../../../utils/utils';

@Component({
  selector: 'app-form-fecha',
  templateUrl: './form-fecha.component.html',
  styleUrl: './form-fecha.component.scss',
})
export class FormFechaComponent {
  _idRegistro: any;
  _idAprobador: any;
  _idRegistroAprobador: any;
  diasDisponibles: any;
  diasSeleccionados: {
    fecha: Date;
    jornada: 'completa' | 'media';
    turno: 'mañana' | 'tarde' | '';
    gestion: Date;
    solicitudIndex: any;
  }[] = [];

  meses = Array(12).fill(0);
  diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  notification = { message: '', type: '' };
  estado: string = 'ENVIADO';
  habilitar: boolean = true;
  reemplazo: string = '';
  solicitudesSinReemplazo: any = [];
  descripcion: string = '';

  fechaEnvio: string = '';
  gestion: string = '';

  anioGestion = new Date().getFullYear();
  restricciones: any;

  solicitudActual: any = [
    {
      dias: [],
      dias_totales: 0,
      gestion: new Date(),
    },
  ];
  mesActualIndex: number = new Date().getMonth();

  esAprobador: boolean = false;
  esDetalle: boolean = false;
  esVista: boolean = false;
  estadoAprobador: string = '';
  modoEdicion: boolean = false;
  solicitudId: string | null = null;
  solicitud: any;
  observacion: string = '';

  id_recursos_humanos: string = '695808c0a886da9f714a6945';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<FormFechaComponent>,
    private authService: AuthService,
    private solicitudService: SolicitudesService,
  ) {
    this._idRegistro = this.authService.getUserRegistro().toString();
    this._idAprobador = this.authService.getAprobador().toString();
  }

  ngOnInit() {
    this.load();
  }

  load() {
    this.esAprobador = this.data?.esAprobador ?? false;
    this.esDetalle = this.data?.esDetalle ?? false;
    this.esVista = this.data?.esVista ?? false;
    this.estadoAprobador = this.data?.estadoAprobador || 'PENDIENTE';
    this._idRegistroAprobador = this.data?._idRegistroAprobador;
    this.modoEdicion = this.data?.editar ?? false;

    if (this.modoEdicion && this.data?.id_contenido) {
      this.solicitudActual = [this.data];
      this.gestion = this.data?.gestion;
      this.fechaEnvio = this.data?.fecha_envio;
      this.estado = this.data?.estado || 'ENVIADO';
      this.descripcion = this.data?.detalle || '';
      this.observacion = this.data?.observacion || '';
      this.data = this.data.id_contenido;
      this.cargarPlanificacionExistente(this.solicitudActual);
    } else {
      this.diasDisponibles = this.data.restricciones.limite_dias;
    }

    this.restricciones = this.data.restricciones;
  }

  cargarPlanificacionExistente(planificaciones: any[]): void {
    this.diasSeleccionados = [];
    this.diasDisponibles = this.data?.restricciones?.limite_dias || 0;

    planificaciones.forEach((planificacion, index) => {
      planificacion.dias.forEach((dia: any) => {
        const datePart = dia.fecha.split('T')[0];
        const [year, month, day] = datePart.split('-').map(Number);
        const fechaLocal = new Date(year, month - 1, day);

        this.diasSeleccionados.push({
          fecha: fechaLocal,
          jornada: dia.jornada,
          turno: dia.turno,
          gestion: planificacion.gestion,
          solicitudIndex: index,
        });
        this.diasDisponibles -= dia.jornada === 'media' ? 0.5 : 1;
      });
    });

    this.posicionarCalendarioEnPrimeraFecha();
    this.mostrarNotificacion('Planificación cargada exitosamente.', 'success');
  }

  private posicionarCalendarioEnPrimeraFecha(): void {
    if (!this.diasSeleccionados.length) {
      return;
    }

    this.diasSeleccionados.sort(
      (a, b) => a.fecha.getTime() - b.fecha.getTime(),
    );

    const primeraFecha = this.diasSeleccionados[0].fecha;

    this.mesActualIndex = primeraFecha.getMonth();
    this.anioGestion = primeraFecha.getFullYear();
  }

  mostrarNotificacion(
    message: string,
    type: 'success' | 'error' | 'info',
    duration = 5000,
  ): void {
    this.notification.message = message;
    this.notification.type = type;

    setTimeout(() => {
      this.notification.message = '';
    }, duration);
  }

  getNombreMes(index: number): string {
    const mesesNombre = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    return mesesNombre[index];
  }

  getDiasDelMes(mes: number): Date[] {
    const dias: Date[] = [];
    const fechaInicio = new Date(this.anioGestion, mes, 1);
    const fechaFin = new Date(this.anioGestion, mes + 1, 0);

    const diasVacios =
      fechaInicio.getDay() === 0 ? 6 : fechaInicio.getDay() - 1;
    const primerDiaMes = new Date(fechaInicio);
    primerDiaMes.setDate(fechaInicio.getDate() - diasVacios);

    for (let d = primerDiaMes; d <= fechaFin; d.setDate(d.getDate() + 1)) {
      dias.push(new Date(d));
    }

    return dias;
  }

  esDiaSeleccionado(dia: Date): boolean {
    return this.diasSeleccionados.some(
      (element) => element.fecha.toDateString() === dia.toDateString(),
    );
  }

  esDiaSeleccionadoTurno(dia: Date, turno: 'mañana' | 'tarde'): boolean {
    return this.diasSeleccionados.some(
      (element) =>
        element.fecha.toDateString() === dia.toDateString() &&
        element.turno === turno,
    );
  }

  esDiaNoPermitido(dia: Date): boolean {
    const isFestivo = this.restricciones.dias_no_permitidos.some(
      (element: string | Date) => {
        const fecha = new Date(element);
        return (
          fecha.getFullYear() === dia.getFullYear() &&
          fecha.getMonth() === dia.getMonth() &&
          fecha.getDate() === dia.getDate()
        );
      },
    );

    const diaNormalizado = this.normalizarFecha(dia);

    const isInRangoNoPermitido = this.restricciones.fechas_no_permitidas.some(
      (range: any) => {
        const inicio = this.normalizarFecha(range.inicio);
        const fin = this.normalizarFecha(range.fin);
        return diaNormalizado >= inicio && diaNormalizado <= fin;
      },
    );
    return isFestivo || isInRangoNoPermitido;
  }

  esDiaPasado(dia: Date): boolean {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const diasAnticipacion: number =
      this.data?.restricciones?.max_dias_anticipacion ?? 0;
    const diasPlazo: number = this.data?.restricciones?.max_dias_plazo ?? 0;

    const fechaMinima = new Date(hoy);
    fechaMinima.setDate(hoy.getDate() + diasAnticipacion);

    const fechaMaxima = new Date(hoy);
    fechaMaxima.setDate(hoy.getDate() - diasPlazo);

    if (diasAnticipacion !== 0 && dia < fechaMinima) {
      return true;
    }

    if (diasPlazo !== 0 && (dia < fechaMaxima || dia > fechaMinima)) {
      return true;
    }

    return false;
  }

  esDiaDelMesAnterior(dia: Date, mesIndex: number): boolean {
    const fechaInicioMes = new Date(this.anioGestion, mesIndex, 1);
    const fechaFinMes = new Date(this.anioGestion, mesIndex + 1, 0);

    return dia < fechaInicioMes || dia > fechaFinMes;
  }

  obtenerIndiceSolicitud(dia: Date): number {
    const seleccion = this.diasSeleccionados.find(
      (element: any) => element.fecha.getTime() === dia.getTime(),
    );

    if (seleccion) {
      return seleccion.solicitudIndex;
    }

    if (this.diasDisponibles > 0) {
      const seleccionDia = this.diasDisponibles;

      if (seleccionDia >= 0) {
        return seleccionDia;
      }
    }

    return this.solicitudActual.findIndex(
      (solicitud: any) =>
        dia.getFullYear() === new Date(solicitud.gestion).getFullYear(),
    );
  }

  seleccionarDia(dia: Date, mesIndex: number): void {
    if (!this.data || this.solicitudActual.length === 0) {
      return;
    }

    if (
      this.esDiaDelMesAnterior(dia, mesIndex) ||
      this.esDiaNoPermitido(dia) ||
      this.esDiaPasado(dia)
    ) {
      this.mostrarNotificacion('Este día no puede ser seleccionado.', 'error');
      return;
    }

    const solicitudIndex = this.obtenerIndiceSolicitud(dia);

    const diasSeleccionadosMes = this.diasSeleccionados.filter(
      (element) =>
        element.fecha.getMonth() === mesIndex &&
        element.solicitudIndex === solicitudIndex,
    );

    const diaKey = this.getDateKey(dia);

    const index = this.diasSeleccionados.findIndex(
      (element) => this.getDateKey(element.fecha) === diaKey,
    );

    if (index !== -1) {
      const diaSeleccionado = this.diasSeleccionados[index];

      const resta = diaSeleccionado.jornada === 'media' ? 0.5 : 1;
      this.actualizarDiasRestantes(resta);

      this.diasSeleccionados.splice(index, 1);
      this.mostrarNotificacion('Día deseleccionado.', 'info');
      return;
    }

    if (
      diasSeleccionadosMes.length < this.restricciones.max_dias_mes &&
      this.diasDisponibles > 0
    ) {
      const dialogRef = this.dialog.open(ModalVacacionComponent, {
        width: '375px',
        data: {
          dias: this.diasDisponibles,
        },
      });

      dialogRef.afterClosed().subscribe((result: any) => {
        if (result) {
          const { jornada, turno } = result;

          this.diasSeleccionados.push({
            fecha: dia,
            jornada,
            turno: jornada === 'completa' ? '' : turno,
            gestion: new Date(),
            solicitudIndex,
          });

          const resta = jornada === 'media' ? 0.5 : 1;
          this.actualizarDiasRestantes(-resta);

          this.mostrarNotificacion(
            `Días restantes disponibles: ${this.diasDisponibles}`,
            'success',
          );
        }
      });
    } else if (this.diasDisponibles === 0) {
      this.mostrarNotificacion(
        'Has seleccionado el máximo de días disponibles para esta solicitud.',
        'error',
      );
    } else {
      this.mostrarNotificacion(
        'Has alcanzado el máximo de días permitidos en este mes.',
        'error',
      );
    }
  }

  salir(): void {
    this.dialogRef.close();
  }

  totalDias(diasSeleccionados: any) {
    let cantidad = diasSeleccionados.map((dia: any) => ({
      valor: dia.jornada === 'completa' ? 1 : 0.5,
    }));

    let totalDiasSeleccionados = cantidad.reduce(
      (acumulado: any, dia: any) => acumulado + dia.valor,
      0,
    );
    return totalDiasSeleccionados;
  }

  actualizarDiasRestantes(cantidad: number): void {
    this.diasDisponibles += cantidad;
  }

  enviarSolicitud(): void {
    this.solicitudesSinReemplazo = this.solicitudActual
      .map((solicitud: any, index: number) => ({ solicitud, index }))
      .filter(
        ({ solicitud }: { solicitud: any }) =>
          !solicitud.reemplazo || !this.isValidObjectId(solicitud.reemplazo),
      );

    if (this.restricciones?.reemplazo) {
      this.openReemplazoModal();
    } else {
      this.guardar();
    }
  }

  guardar() {
    const diasAgrupados = this.diasSeleccionados.reduce((acc: any, dia) => {
      if (!acc[dia.solicitudIndex]) {
        acc[dia.solicitudIndex] = [];
      }
      acc[dia.solicitudIndex].push(dia);
      return acc;
    }, {});

    this.solicitudActual.forEach((solicitud: any, index: number) => {
      const diasGestion = diasAgrupados[index] || [];
      if (diasGestion.length > 0) {
        diasGestion.sort(
          (a: any, b: any) =>
            new Date(a.fecha).getTime() - new Date(b.fecha).getTime(),
        );
      }

      const payload = {
        dias: this.diasSeleccionados.map((dia: any) => ({
          fecha: new Date(dia.fecha).toISOString().split('T')[0],
          jornada: dia.jornada,
          turno: dia.turno || '',
        })),
        dias_totales: this.totalDias(this.diasSeleccionados),
        gestion: this.gestion || new Date(),
        fecha_inicio: this.diasSeleccionados[0]?.fecha || new Date(),
        fecha_fin:
          this.diasSeleccionados[this.diasSeleccionados.length - 1]?.fecha ||
          new Date(),
        detalle: this.descripcion,
        observacion: this.observacion,
        reemplazo: this.data?._id,
        id_registro: this._idRegistro,
        id_contenido: this.data?._id,
        id_cargo_aprobador: this._idAprobador,
        fecha_envio: this.fechaEnvio || new Date(),
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

      if (this.modoEdicion && this.solicitudActual[index]._id) {
        this.solicitudService
          .updateSolicitud(this.solicitudActual[index]._id, payload)
          .subscribe((response) => {
            if (index === this.solicitudActual.length - 1) {
              this.dialogRef.close(response);
            }
          });
      } else {
        this.solicitudService.addSolicitud(payload).subscribe((response) => {
          if (index === this.solicitudActual.length - 1) {
            this.dialogRef.close(response);
          }
        });
      }
    });
  }

  convertToTimezoneISO(element: Date): string {
    return convertToTimezone(element);
  }

  openReemplazoModal() {
    const modalRef = this.dialog.open(ModalReemplazoComponent, {
      width: '400px',
    });
    modalRef.componentInstance.personal = this.data.personal;

    modalRef.componentInstance.reemplazoSeleccionado.subscribe(
      (persona: any) => {
        this.reemplazo = persona._id;

        this.solicitudesSinReemplazo.forEach(({ index }: { index: number }) => {
          this.solicitudActual[index]['reemplazo'] = this.reemplazo;
        });
      },
    );
  }

  isValidObjectId(id: string): boolean {
    return /^[a-f\d]{24}$/i.test(id);
  }

  mostrarMesAnterior(): void {
    if (this.mesActualIndex > 0) {
      this.mesActualIndex--;
    }
  }

  mostrarMesSiguiente(): void {
    if (this.mesActualIndex < 11) {
      this.mesActualIndex++;
    }
  }

  get mesActualNombre(): string {
    return this.getNombreMes(this.mesActualIndex);
  }

  normalizarFecha(fecha: Date | string): Date {
    const f = new Date(fecha);
    return new Date(f.getFullYear(), f.getMonth(), f.getDate());
  }

  formatearDias(dias: number): string {
    const diasEnteros = Math.floor(dias);
    const tieneMedia = dias % 1 !== 0;

    if (diasEnteros === 0 && tieneMedia) {
      return 'media jornada';
    }

    if (diasEnteros > 0 && tieneMedia) {
      return `${diasEnteros} día${diasEnteros > 1 ? 's' : ''} y media jornada`;
    }

    return `${diasEnteros} día${diasEnteros !== 1 ? 's' : ''}`;
  }

  private getDateKey(date: Date): string {
    return convertToTimezone(date);
  }

  obtenerEstadoConfirmado() {
    if (this.estado === 'DENEGADO') return 'DENEGADO';
    if (this._idAprobador === this.id_recursos_humanos) return 'PENDIENTE';
    return this.estado || 'ENVIADO';
  }

  capitalizeFirst(text: string): string {
    return getIncialesMayuscula(text);
  }

  observacionInvalida(): boolean {
    if (this.estado === 'RECHAZADO' || this.estado === 'DENEGADO') {
      return !this.observacion || this.observacion.trim().length < 5;
    }
    return false;
  }
}
