import { Component, Inject } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { ModalVacacionComponent } from '../../content/modal-vacacion/modal-vacacion.component';
import { SolicitudesService } from '../../../services/solicitudes.service';
import { ModalReemplazoComponent } from '../../content/modal-reemplazo/modal-reemplazo.component';

@Component({
  selector: 'app-form-vacacion',
  templateUrl: './form-vacacion.component.html',
  styleUrl: './form-vacacion.component.scss',
})
export class FormVacacionComponent {
  diasSeleccionados: {
    fecha: Date;
    jornada: 'completa' | 'media';
    turno: 'mañana' | 'tarde' | '';
    gestion: Date;
    solicitudIndex: any;
  }[] = [];
  diasRestantesActual: number = 0;
  diasRestantesAnterior: number = 0;
  meses = Array(12).fill(0);
  diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  notification = { message: '', type: '' };
  estado: boolean = true;
  habilitar: boolean = true;
  reemplazo: string = '';
  solicitudesSinReemplazo: any = [];

  anioGestion = new Date().getFullYear();
  restricciones = {
    maxDiasPorMes: 31,

    diasNoPermitidos: ['2024-1-1', '2024-12-25'].map((date) => new Date(date)),
    rangoFechasNoPermitidas: [
      { inicio: new Date('2024-01-15'), fin: new Date('2024-01-30') },
    ],
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<FormVacacionComponent>,
    private solicitudService: SolicitudesService,
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    if (
      this.data &&
      this.data?.diasVacaciones.length > 0 &&
      this.data?.solicitudActual.length === 0
    ) {
      this.data.solicitudActual.push({
        dias: [],
        dias_totales: 0,
        gestion: this.data?.diasVacaciones[0].gestion,
        tipo: 'VA',
        reemplazo: '',
        estado: 'PENDIENTE',
      });
      if (this.data?.diasVacaciones.length === 2) {
        this.data.solicitudActual.push({
          dias: [],
          dias_totales: 0,
          gestion: this.data?.diasVacaciones[1].gestion,
          tipo: 'VA',
          reemplazo: '',
          estado: 'PENDIENTE',
        });
      }
    }
    this.diasRestantesActual =
      this.data?.diasVacaciones[0]?.diasDisponibles || 0;
    this.diasRestantesAnterior =
      this.data?.diasVacaciones[1]?.diasDisponibles || 0;

    if (this.data?.solicitudActual.length > 0) {
      this.encontrarEstado();
      this.habilitarSend();
      this.cargarPlanificacionExistente(this.data.solicitudActual);
    }
  }

  encontrarEstado() {
    this.estado = this.data.solicitudActual.some(
      (solicitud: any) =>
        solicitud.estado === 'PENDIENTE' && solicitud.id_registro,
    );
  }

  habilitarSend() {
    this.habilitar = this.data.solicitudActual.every(
      (solicitud: any) => solicitud.estado === 'APROBADO',
    );
  }

  cargarPlanificacionExistente(planificaciones: any[]): void {
    const añoActual = new Date().getFullYear();
    this.diasSeleccionados = [];

    planificaciones.forEach((planificacion, index) => {
      planificacion.dias
        .filter((dia: any) => {
          const fecha = new Date(dia.fecha);
          return fecha.getFullYear() === añoActual;
        })
        .forEach((dia: any) => {
          this.diasSeleccionados.push({
            fecha: new Date(dia.fecha),
            jornada: dia.jornada,
            turno: dia.turno,
            gestion: planificacion.gestion,
            solicitudIndex: index,
          });
        });
    });

    this.mostrarNotificacion('Planificación cargada exitosamente.', 'success');
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
    const isFestivo = this.restricciones.diasNoPermitidos.some(
      (element) => element.toDateString() === dia.toDateString(),
    );
    const isInRangoNoPermitido =
      this.restricciones.rangoFechasNoPermitidas.some(
        (range) => dia >= range.inicio && dia <= range.fin,
      );
    return isFestivo || isInRangoNoPermitido;
  }

  esDiaPasado(dia: Date): boolean {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const ayer = new Date(hoy);
    ayer.setDate(hoy.getDate() - 1);
    const mañana = new Date(hoy);
    mañana.setDate(hoy.getDate() + 1);

    const isDiaAnteriorOMañana =
      dia <= hoy || dia.toDateString() === mañana.toDateString();

    return isDiaAnteriorOMañana;
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

    if (this.data.diasVacaciones.length > 0) {
      const seleccionDia =
        this.data.diasVacaciones.length > 1 &&
        this.data.diasVacaciones[1].diasDisponibles > 0
          ? 1
          : this.data.diasVacaciones.findIndex(
              (vacacion: any) => vacacion.diasDisponibles > 0,
            );

      if (seleccionDia >= 0) {
        return seleccionDia;
      }
    }

    return this.data.solicitudActual.findIndex(
      (solicitud: any) =>
        dia.getFullYear() === new Date(solicitud.gestion).getFullYear(),
    );
  }

  seleccionarDia(dia: Date, mesIndex: number): void {
    if (
      !this.data ||
      this.data.solicitudActual.length === 0 ||
      !this.data.solicitudActual.some(
        (solicitud: any) => solicitud.estado === 'PENDIENTE',
      )
    ) {
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

    const index = this.diasSeleccionados.findIndex(
      (element) =>
        element.fecha.toDateString() === dia.toDateString() &&
        element.solicitudIndex === solicitudIndex,
    );

    if (index !== -1) {
      const diaSeleccionado = this.diasSeleccionados[index];

      const resta = diaSeleccionado.jornada === 'media' ? 0.5 : 1;
      this.actualizarDiasRestantes(solicitudIndex, resta);

      this.diasSeleccionados.splice(index, 1);
      this.mostrarNotificacion('Día deseleccionado.', 'info');
      return;
    }

    if (
      diasSeleccionadosMes.length < this.restricciones.maxDiasPorMes &&
      this.data.diasVacaciones[solicitudIndex].diasDisponibles > 0
    ) {
      const dialogRef = this.dialog.open(ModalVacacionComponent, {
        width: '375px',
        data: {
          dias: this.data.diasVacaciones[solicitudIndex].diasDisponibles,
        },
      });

      dialogRef.afterClosed().subscribe((result: any) => {
        if (result) {
          const { jornada, turno } = result;

          this.diasSeleccionados.push({
            fecha: dia,
            jornada,
            turno: jornada === 'completa' ? '' : turno,
            gestion: this.data.diasVacaciones[solicitudIndex].gestion,
            solicitudIndex,
          });

          const resta = jornada === 'media' ? 0.5 : 1;
          this.actualizarDiasRestantes(solicitudIndex, -resta);

          this.mostrarNotificacion(
            `Días restantes disponibles: ${this.data.diasVacaciones[solicitudIndex].diasDisponibles}`,
            'success',
          );
        }
      });
    } else if (this.data.diasVacaciones[solicitudIndex].diasDisponibles === 0) {
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

  actualizarDiasRestantes(solicitudIndex: number, cantidad: number): void {
    this.data.diasVacaciones[solicitudIndex].diasDisponibles += cantidad;
    if (solicitudIndex === 1) {
      this.diasRestantesAnterior =
        this.data.diasVacaciones[solicitudIndex].diasDisponibles;
    } else {
      this.diasRestantesActual =
        this.data.diasVacaciones[solicitudIndex].diasDisponibles;
    }
  }

  guardarVacaciones(): void {
    this.solicitudesSinReemplazo = this.data.solicitudActual
      .map((solicitud: any, index: number) => ({ solicitud, index }))
      .filter(
        ({ solicitud }: { solicitud: any }) =>
          !solicitud.reemplazo || !this.isValidObjectId(solicitud.reemplazo),
      );

    if (this.solicitudesSinReemplazo.length > 0) {
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

    this.data.solicitudActual.forEach((solicitud: any, index: number) => {
      const diasGestion = diasAgrupados[index] || [];
      if (diasGestion.length > 0) {
        diasGestion.sort(
          (a: any, b: any) =>
            new Date(a.fecha).getTime() - new Date(b.fecha).getTime(),
        );
      }

      let payload = {
        tipo: 'VA',
        dias: diasGestion,
        dias_totales: this.totalDias(diasGestion),
        gestion: this.data.solicitudActual[index].gestion,
        fecha_inicio: diasGestion[0]?.fecha || null,
        fecha_fin: diasGestion[diasGestion.length - 1]?.fecha || null,
        detalle: 'Planificación de vacaciones',
        reemplazo:
          this.data?.solicitudActual[index]?.reemplazo &&
          this.isValidObjectId(solicitud.reemplazo)
            ? this.data?.solicitudActual[index]?.reemplazo
            : this.reemplazo,
        estado: solicitud.estado || 'PENDIENTE',
        id_registro: this.data?._id,
      };

      if (diasGestion.length > 0) {
        if (this.data.solicitudActual[index].id_registro?._id) {
          this.solicitudService
            .updateSolicitud(solicitud._id, payload)
            .subscribe((response) => {
              if (index === this.data.solicitudActual.length - 1) {
                this.dialogRef.close(response);
              }
            });
        } else {
          this.solicitudService.addSolicitud(payload).subscribe((response) => {
            if (index === this.data.solicitudActual.length - 1) {
              this.dialogRef.close(response);
            }
          });
        }
      }
    });
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
          this.data.solicitudActual[index]['reemplazo'] = this.reemplazo;
        });
      },
    );
  }

  isValidObjectId(id: string): boolean {
    return /^[a-f\d]{24}$/i.test(id);
  }
}
