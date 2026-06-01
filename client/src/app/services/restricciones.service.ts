import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RestriccionesService {
  constructor() {}

  obtenerFechaMinimaPermitida(
    hoy: Date,
    plz: number,
    restricciones: any,
  ): Date {
    let fecha = new Date(hoy);
    const aplicarDiasHabiles = restricciones?.dias_habiles ?? false;
    const diasNoPermitidos = restricciones?.dias_no_permitidos ?? [];

    const hoyEsFeriado = diasNoPermitidos.some(
      (f: any) => new Date(f).toDateString() === hoy.toDateString(),
    );
    const hoyEsFinde =
      aplicarDiasHabiles && (hoy.getDay() === 0 || hoy.getDay() === 6);

    let diasContados = hoyEsFeriado || hoyEsFinde ? 0 : 1;

    while (diasContados < plz) {
      fecha.setDate(fecha.getDate() - 1);
      const nroDiaSemana = fecha.getDay();
      const esFeriado = diasNoPermitidos.some(
        (f: any) => new Date(f).toDateString() === fecha.toDateString(),
      );

      if (esFeriado) continue;
      if (aplicarDiasHabiles && (nroDiaSemana === 0 || nroDiaSemana === 6))
        continue;

      diasContados++;
    }

    let validado = false;
    while (!validado) {
      const nroDiaSemana = fecha.getDay();
      const esFeriado = diasNoPermitidos.some(
        (f: any) => new Date(f).toDateString() === fecha.toDateString(),
      );
      if (
        esFeriado ||
        (aplicarDiasHabiles && (nroDiaSemana === 0 || nroDiaSemana === 6))
      ) {
        fecha.setDate(fecha.getDate() - 1);
      } else {
        validado = true;
      }
    }

    fecha.setHours(0, 0, 0, 0);
    return fecha;
  }

  obtenerFechaMinimaFutura(hoy: Date, ant: number, restricciones: any): Date {
    let fecha = new Date(hoy);
    const aplicarDiasHabiles = restricciones?.dias_habiles ?? false;
    const diasNoPermitidos = restricciones?.dias_no_permitidos ?? [];
    let diasContados = 0;

    while (diasContados < ant) {
      fecha.setDate(fecha.getDate() + 1);
      const esFeriado = diasNoPermitidos.some(
        (f: any) => new Date(f).toDateString() === fecha.toDateString(),
      );
      if (esFeriado) continue;

      if (aplicarDiasHabiles) {
        if (fecha.getDay() !== 0 && fecha.getDay() !== 6) diasContados++;
      } else {
        diasContados++;
      }
    }
    fecha.setHours(0, 0, 0, 0);
    return fecha;
  }
}
