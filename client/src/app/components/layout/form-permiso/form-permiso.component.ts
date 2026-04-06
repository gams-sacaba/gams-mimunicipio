import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from '../../../services/auth.service';
import { SolicitudesService } from '../../../services/solicitudes.service';

@Component({
  selector: 'app-form-permiso',
  templateUrl: './form-permiso.component.html',
  styleUrl: './form-permiso.component.scss',
})
export class FormPermisoComponent {
  idName: any;
  fechaInicio: any;
  fechaFin: any;
  permiso: string = '';
  detalle: string = '';
  observacion: string = '';
  dias: any[] = [];
  estado: string = '';
  mensajeError: string | null = null;
  mensajeTimeout: any = null;

  fechasSeleccionadas: Date[] = [];
  fechaSeleccionada: Date | null = null;
  mostrarCalendario = false;

  feriados: string[] = ['01-01', '05-01', '06-21', '08-06', '11-02', '12-25'];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<FormPermisoComponent>,
    private authService: AuthService,
    private solicitudService: SolicitudesService,
  ) {
    this.idName = this.authService.getUserNameValue().toString();
  }

  ngOnInit(): void {}

  esFeriado(fecha: Date): boolean {
    const mesDia = `${(fecha.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${fecha.getDate().toString().padStart(2, '0')}`;
    return this.feriados.includes(mesDia);
  }

  actualizarTurno(index: number) {
    if (this.dias[index].jornada === 'completa') {
      this.dias[index].turno = '';
    }
  }

  enviarSolicitud() {
    if (this.fechasSeleccionadas.length > 1) {
      this.fechaInicio = new Date(this.fechasSeleccionadas[0]);
      this.fechaFin = new Date(
        this.fechasSeleccionadas[this.fechasSeleccionadas.length - 1],
      );
    } else if (this.fechasSeleccionadas.length === 1) {
      this.fechaInicio = new Date(this.fechasSeleccionadas[0]);
      this.fechaFin = new Date(this.fechasSeleccionadas[0]);
    } else {
      return;
    }

    let solicitud = {
      tipo: this.data.tipo.toUpperCase(),
      fecha_inicio: this.fechaInicio,
      fecha_fin: this.fechaFin,
      gestion: new Date(),
      dias: this.dias
        ? this.dias.map((dia: any) => ({
            fecha: dia.fecha.split('T')[0],
            jornada: dia.jornada,
            turno: dia.turno || '',
          }))
        : [],
      dias_totales: this.calcularDiasTotales(),
      detalle: this.detalle.toUpperCase(),
      observacion: this.observacion.toUpperCase(),
      estado: this.estado || 'PENDIENTE',
      id_registro: this.data?._id,
      id_contenido: this.data?.id_contenido,
    };

    this.solicitudService.addSolicitud(solicitud).subscribe((response) => {
      this.dialogRef.close(response);
    });
  }

  calcularDiasTotales() {
    return this.dias.reduce((total, dia) => {
      return (
        total +
        (dia.jornada === 'completa' ? 1 : dia.jornada === 'media' ? 0.5 : 0)
      );
    }, 0);
  }

  formularioValido(): boolean {
    if (!this.fechasSeleccionadas || this.fechasSeleccionadas.length === 0) {
      return false;
    }

    if (!this.data?.tipo || !this.detalle || this.detalle.length < 5) {
      return false;
    }

    return this.dias.every((dia) => {
      if (!dia.jornada) return false;
      if (dia.jornada === 'media' && !dia.turno) return false;
      return true;
    });
  }

  agregarFechaSeleccionada(fecha: any): void {
    if (this.esFeriado(fecha)) {
      this.mensajeError =
        'La fecha seleccionada es un día feriado y no puede ser seleccionada.';

      clearTimeout(this.mensajeTimeout);
      this.mensajeTimeout = setTimeout(() => {
        this.mensajeError = null;
      }, 3000);
      return;
    }

    this.mensajeError = null;

    const yaSeleccionada = this.fechasSeleccionadas.some(
      (f) => f.getTime() === fecha.getTime(),
    );

    if (yaSeleccionada) {
      this.fechasSeleccionadas = this.fechasSeleccionadas.filter(
        (f) => f.getTime() !== fecha.getTime(),
      );
    } else {
      this.fechasSeleccionadas.push(fecha);
      this.fechasSeleccionadas.sort((a, b) => a.getTime() - b.getTime());
    }

    this.generarDias();
  }

  generarDias(): void {
    this.dias = this.fechasSeleccionadas.map((fecha) => ({
      fecha: fecha.toISOString().split('T')[0],
      jornada: 'completa',
      turno: '',
    }));
  }

  mostrarFechasSeleccionadas(): string {
    return this.fechasSeleccionadas
      .map((fecha) => fecha.toLocaleDateString())
      .join(', ');
  }

  toggleCalendario(): void {
    this.mostrarCalendario = !this.mostrarCalendario;
  }

  eliminarDia(indice: number): void {
    const diaEliminado = this.dias[indice];

    const [year, month, day] = diaEliminado.fecha.split('-').map(Number);
    const fechaEliminada = new Date(year, month - 1, day);

    this.dias.splice(indice, 1);

    this.fechasSeleccionadas = this.fechasSeleccionadas.filter(
      (fecha) => fecha.getTime() !== fechaEliminada.getTime(),
    );
  }
}
