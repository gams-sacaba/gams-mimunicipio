import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../../services/auth.service';
@Component({
  selector: 'app-solicitudes',
  templateUrl: './solicitudes.component.html',
  styleUrl: './solicitudes.component.scss',
})
export class SolicitudesComponent implements OnInit {
  funcionario: any;
  _id: string;
  contenidos: any[] = [];
  solicitudes: any[] = [];
  registros: any;
  data: any;

  permissions: string[] = [];
  constructor(private authService: AuthService) {
    this._id = this.authService.getUserFuncionario().toString();
    this.authService.getAccessibleModules().subscribe((modules: any) => {
      if (modules && modules['solicitudes']) {
        this.permissions = modules['solicitudes'];
      }
    });
  }

  ngOnInit(): void {
    this.load();
  }

  async load() {}

  combinedData(registros: any, dependencias: any, unidades: any) {
    let funcionario = '';

    this.registros = registros.find((element: any) => element.estado === true);

    let total: any;

    if (this.registros && this.registros.id_cargo?.contrato === 'ITEM') {
      funcionario = this.registros.id_funcionario;
      total = this.calcularDiasVacaciones(registros);
    }

    registros = registros.map((registro: any) => {
      const idDependencia = registro.id_cargo?.id_dependencia;
      const idUnidad = registro.id_cargo?.id_unidad;

      const dependencia = dependencias.find(
        (dep: any) => dep._id === idDependencia,
      );

      if (dependencia) {
        registro.id_cargo.id_dependencia = {
          ...dependencia,
        };
      }

      const unidad = unidades.find((dep: any) => dep._id === idUnidad);

      if (unidad) {
        registro.id_cargo.id_unidad = {
          _id: registro.id_cargo.id_unidad,
          nombre: unidad.nombre,
        };
      }

      return registro;
    });

    this.solicitudes =
      this.solicitudes.length > 0
        ? this.solicitudes.map((solicitud: any) => {
            const registro = registros.find(
              (reg: any) => reg._id === solicitud.id_registro,
            );

            if (registro) {
              solicitud.id_registro = registro;
            }

            return solicitud;
          })
        : [];

    return {
      id_registro: this.registros?._id,
      id_funcionario: this.registros?.id_funcionario,
      id_cargo: this.registros?.id_cargo,
      solicitudes: this.solicitudes,
      diasVacaciones: total,
    };
  }

  calcularDiasVacaciones(registros: any) {
    let fechaIngreso: any;
    let fechaVacacionActual: any;
    let fechaVacacionAnterior: any;
    let nuevaFechaVacacionActual: any;
    let nuevaFechaVacacionAnterior: any;
    let añosServicio: any;
    let diasVacacionesActual = 0;
    let diasVacacionesAnterior = 0;
    let diasUsados: any;
    let diasGestionActual = 0;
    let diasGestionAnterior: any;

    const contratosItem = registros
      .filter(
        (element: any) =>
          element.id_cargo?.contrato === 'ITEM' && element.fecha_ingreso,
      )
      .sort(
        (a: any, b: any) =>
          new Date(a.fecha_ingreso).getTime() -
          new Date(b.fecha_ingreso).getTime(),
      );

    if (contratosItem.length > 0) {
      if (contratosItem.length > 1) {
        fechaIngreso = this.calcularFechaIngreso(contratosItem);
      } else if (contratosItem.length === 1) {
        fechaIngreso = new Date(contratosItem[0].fecha_ingreso);
      }

      fechaVacacionActual = fechaIngreso;
      fechaVacacionAnterior = fechaIngreso;

      if (contratosItem.length > 0) {
        const fechaActual = new Date();

        añosServicio = fechaActual.getFullYear() - fechaIngreso.getFullYear();

        let fechaLimite = new Date(fechaIngreso);
        fechaLimite.setFullYear(fechaLimite.getFullYear() + añosServicio);

        fechaLimite.setDate(fechaLimite.getDate() + 2);

        if (fechaActual < fechaLimite) {
          añosServicio--;
        }

        if (añosServicio > 0) {
          if (añosServicio === 1) {
            diasVacacionesActual = 15;
          } else if (añosServicio <= 5) {
            diasVacacionesActual = 15;
            diasVacacionesAnterior = 15;
          } else if (añosServicio === 6) {
            diasVacacionesActual = 20;
            diasVacacionesAnterior = 15;
          } else if (añosServicio >= 7 && añosServicio <= 10) {
            diasVacacionesActual = 20;
            diasVacacionesAnterior = 20;
          } else if (añosServicio === 11) {
            diasVacacionesActual = 30;
            diasVacacionesAnterior = 20;
          } else {
            diasVacacionesActual = 30;
            diasVacacionesAnterior = 30;
          }

          nuevaFechaVacacionActual = new Date(fechaVacacionActual);
          nuevaFechaVacacionAnterior = new Date(fechaVacacionAnterior);
          if (añosServicio === 1) {
            nuevaFechaVacacionActual.setFullYear(
              nuevaFechaVacacionActual.getFullYear() + 1,
            );
          } else if (añosServicio === 2) {
            nuevaFechaVacacionActual.setFullYear(
              nuevaFechaVacacionActual.getFullYear() + 2,
            );

            nuevaFechaVacacionAnterior.setFullYear(
              nuevaFechaVacacionAnterior.getFullYear() + 1,
            );
          } else if (añosServicio > 5) {
            nuevaFechaVacacionActual.setFullYear(
              nuevaFechaVacacionActual.getFullYear() + (añosServicio - 1),
            );
            nuevaFechaVacacionAnterior.setFullYear(
              nuevaFechaVacacionAnterior.getFullYear() + (añosServicio - 2),
            );
          }

          let vacacion = [
            {
              gestion: nuevaFechaVacacionActual,
              dias: diasVacacionesActual,
            },
          ];

          if (diasVacacionesAnterior !== 0) {
            vacacion.push({
              gestion: nuevaFechaVacacionAnterior,
              dias: diasVacacionesAnterior,
            });
          }

          diasUsados = this.calcularDiasSolicitudes(vacacion);
          diasGestionActual =
            diasVacacionesActual - diasUsados?.diasGestionActual;
          diasGestionAnterior =
            diasVacacionesAnterior - diasUsados.diasGestionAnterior;

          let diasGestion = [
            {
              gestion: nuevaFechaVacacionActual,
              diasVacaciones: diasVacacionesActual,
              diasDisponibles: diasGestionActual,
            },
          ];
          if (añosServicio >= 2) {
            diasGestion.push({
              gestion: nuevaFechaVacacionAnterior,
              diasVacaciones: diasVacacionesAnterior,
              diasDisponibles: diasGestionAnterior,
            });
          }

          return diasGestion;
        }
      }
    }
    return [];
  }

  calcularDiasSolicitudes(vacacion: any) {
    let solicitudActual: any = [];
    let solicitudAnterior: any = [];

    solicitudActual =
      this.solicitudes.filter(
        (element: any) =>
          element.tipo === 'VA' &&
          element.estado !== 'RECHAZADO' &&
          element.estado !== 'VENCIDO' &&
          new Date(element?.gestion).getTime() ===
            new Date(vacacion[0]?.gestion).getTime(),
      ) || [];

    if (vacacion.length === 2) {
      solicitudAnterior =
        this.solicitudes.filter(
          (element: any) =>
            element.tipo === 'VA' &&
            element.estado !== 'RECHAZADO' &&
            element.estado !== 'VENCIDO' &&
            new Date(element?.gestion).getTime() ===
              new Date(vacacion[1]?.gestion).getTime(),
        ) || [];
    }

    const totalDiasActual =
      solicitudActual.length > 0
        ? solicitudActual.reduce(
            (acumulador: number, element: any) =>
              acumulador + (element.dias_totales || 0),
            0,
          )
        : 0;

    const totalDiasAnterior =
      solicitudAnterior.length > 0
        ? solicitudAnterior.reduce(
            (acumulador: number, element: any) =>
              acumulador + (element.dias_totales || 0),
            0,
          )
        : 0;

    return {
      diasGestionActual: totalDiasActual,
      diasGestionAnterior: totalDiasAnterior,
    };
  }

  calcularFechaIngreso(contratosItem: any) {
    if (contratosItem.length === 0) return null;

    let fechaInicioContinua = new Date(contratosItem[0].fecha_ingreso);
    let fechaFinAnterior = new Date(contratosItem[0].fecha_conclusion);

    for (let i = 1; i < contratosItem.length; i++) {
      const fechaIngresoActual = new Date(contratosItem[i].fecha_ingreso);
      const fechaFinActual = new Date(contratosItem[i].fecha_conclusion);

      const diferenciaDias =
        (fechaIngresoActual.getTime() - fechaFinAnterior.getTime()) /
        (1000 * 60 * 60 * 24);

      if (diferenciaDias > 1) {
        fechaInicioContinua = fechaIngresoActual;
      }

      fechaFinAnterior = fechaFinActual;
    }
    return fechaInicioContinua;
  }
}
