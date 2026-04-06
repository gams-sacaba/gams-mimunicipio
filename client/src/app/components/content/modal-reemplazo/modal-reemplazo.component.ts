import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-modal-reemplazo',
  templateUrl: './modal-reemplazo.component.html',
  styleUrls: ['./modal-reemplazo.component.scss'],
})
export class ModalReemplazoComponent {
  @Output() reemplazoSeleccionado = new EventEmitter<any>();

  searchControl = new FormControl('');
  filteredPersonal!: Observable<any[]>;
  personal: any[] = [];
  personaSeleccionada: any = null;

  constructor(private dialogRef: MatDialogRef<ModalReemplazoComponent>) {}

  ngOnInit() {
    this.filteredPersonal = this.searchControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || '')),
    );
  }

  private _filter(value: any): any[] {
    if (typeof value !== 'string') {
      return this.personal;
    }

    const filterValue = value.toLowerCase();
    return this.personal.filter((persona) =>
      `${persona.datosFuncionario.nombre || ''} ${
        persona.datosFuncionario.paterno || ''
      } ${persona.datosFuncionario.materno || ''} ${
        persona.datosFuncionario.casada || ''
      }`
        .toLowerCase()
        .includes(filterValue),
    );
  }

  seleccionarReemplazo(event: any) {
    this.personaSeleccionada = event.option.value;
  }

  aceptar() {
    if (this.personaSeleccionada) {
      this.reemplazoSeleccionado.emit(this.personaSeleccionada);
    }
    this.dialogRef.close();
  }

  cancelar() {
    this.dialogRef.close();
  }

  displayFn(persona: any): string {
    return persona
      ? `${persona.datosFuncionario.nombre} ${persona.datosFuncionario.paterno} ${persona.datosFuncionario.materno}`
      : '';
  }

  clearInput() {
    this.searchControl.setValue('');
  }
}
