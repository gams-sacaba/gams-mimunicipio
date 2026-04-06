import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-modal-vacacion',
  templateUrl: './modal-vacacion.component.html',
  styleUrls: ['./modal-vacacion.component.scss'],
})
export class ModalVacacionComponent {
  jornada: 'completa' | 'media' | null = null;
  turno: 'mañana' | 'tarde' | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ModalVacacionComponent>,
  ) {}

  seleccionarJornada(opcion: 'completa' | 'media') {
    this.jornada = opcion;
    if (opcion === 'completa') {
      this.dialogRef.close({
        jornada: 'completa',
        turno: null,
      });
    }
  }

  seleccionarTurno(opcion: 'mañana' | 'tarde') {
    this.turno = opcion;

    if (this.jornada === 'media') {
      this.dialogRef.close({
        jornada: 'media',
        turno: this.turno,
      });
    }
  }

  cancelar() {
    this.dialogRef.close(null);
  }
}
