import { Component } from '@angular/core';

@Component({
  selector: 'app-card-calendar',
  templateUrl: './card-calendar.component.html',
  styleUrl: './card-calendar.component.scss',
})
export class CardCalendarComponent {
  diasSeleccionados: Date[] = [];
  diasRestantes: number = 15;
  meses = Array.from({ length: 12 });
  restricciones = {
    maxDiasPorMes: 3,
    diasNoPermitidos: ['2024-01-01', '2024-12-25'].map(
      (date) => new Date(date),
    ),
    rangoFechasNoPermitidas: [
      { inicio: new Date('2024-03-01'), fin: new Date('2024-03-15') },
    ],
  };

  minDate = new Date(2024, 0, 1);
  maxDate = new Date(2024, 11, 31);

  getNombreMes(index: number): string {
    const nombresMes = [
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
    return nombresMes[index];
  }

  onDateSelected(date: Date, mesIndex: number) {
    const isDiaNoPermitido = this.restricciones.diasNoPermitidos.some(
      (d) => d.toDateString() === date.toDateString(),
    );
    const isRangoNoPermitido = this.restricciones.rangoFechasNoPermitidas.some(
      (range) => date >= range.inicio && date <= range.fin,
    );
    const diasSeleccionadosMes = this.diasSeleccionados.filter(
      (d) => d.getMonth() === mesIndex,
    );

    if (
      isDiaNoPermitido ||
      isRangoNoPermitido ||
      diasSeleccionadosMes.length >= this.restricciones.maxDiasPorMes
    ) {
      alert('No puedes seleccionar este día.');
      return;
    }

    const index = this.diasSeleccionados.findIndex(
      (d) => d.toDateString() === date.toDateString(),
    );

    if (index === -1) {
      this.diasSeleccionados.push(date);
      this.diasRestantes--;
    } else {
      this.diasSeleccionados.splice(index, 1);
      this.diasRestantes++;
    }
  }
}
