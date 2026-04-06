import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthService } from '../../../services/auth.service';
import { FuncionariosService } from '../../../services/funcionarios.service';
import { SolicitudesService } from '../../../services/solicitudes.service';
import { ContenidosService } from '../../../services/contenidos.service';
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
  constructor(
    private authService: AuthService,
    private funcionarioService: FuncionariosService,
    private contenidoService: ContenidosService,
    private solicitudService: SolicitudesService,
    private cdr: ChangeDetectorRef,
  ) {
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

  async load() {
    // const funcionario$ = this.funcionarioService
    //   .getFuncionarioById(this._id)
    //   .pipe(catchError(() => of([])));
    // forkJoin([funcionario$, contenidos$]).subscribe(
    //   ([funcionarioRes, contenidosRes]) => {
    //     this.data = funcionarioRes;
    //     this.funcionario = this.data?.funcionario;
    //     this.contenidos = contenidosRes;
    //     // Si tenemos un registro, pedimos solicitudes
    //     if (this.data?.registro?._id) {
    //       this.solicitudService
    //         .getFiltroCampos('id_registro', this.data.registro._id)
    //         .pipe(catchError(() => of([])))
    //         .subscribe((solicitudesRes) => {
    //           this.solicitudes = solicitudesRes;
    //           this.cdr.detectChanges();
    //         });
    //     }
    //   }
    // );
  }

  //   async load() {
  //     try {
  //       this.data = await this.funcionarioService
  //         .getFuncionarioById(this._id)
  //         .toPromise();
  //       console.log(this.data);
  //       this.funcionario = this.data?.funcionario;
  //     } catch (error) {
  //       this.data = [];
  //     }
  //     try {
  //       this.solicitudes =
  //         (await this.solicitudService
  //           .getFiltroCampos('id_registro', this.data?.registro._id)
  //           .toPromise()) || [];
  //       console.log('solicitudes: ', this.solicitudes);
  //     } catch (error) {
  //       //console.error('Error al cargar solicitudes:', error);
  //     }

  //     try {
  //       this.contenidos = await this.contenidoService
  //         .getFiltroCampos('estado', 'true')
  //         .toPromise();
  //       console.log(this.contenidos);
  //     } catch (error) {
  //       this.data = [];
  //     }

  //     // let registros = await this.registrosService
  //     //   .getFiltroCampos('id_funcionario', this.id_funcionario)
  //     //   .toPromise();
  //     // let dependencias = await this.dependenciasService
  //     //   .getDependencias()
  //     //   .toPromise();
  //     // let unidades = await this.unidadService.getUnidades().toPromise();

  //     // this.funcionarios = this.combinedData(registros, dependencias, unidades);
  //     //console.log(this.funcionarios);
  //   }

  combinedData(registros: any, dependencias: any, unidades: any) {
    let funcionario = '';
    //calculamos antes de procesar registros con la menor cantidad de datos
    this.registros = registros.find((element: any) => element.estado === true);

    let total: any;

    //Defnimos si el cargo activo es ITEM, si lo es evaluamos los registros
    if (this.registros && this.registros.id_cargo?.contrato === 'ITEM') {
      //console.log('Paso 1: registros: ', registros)
      funcionario = this.registros.id_funcionario;
      total = this.calcularDiasVacaciones(registros);
      //console.log('Paso 13: total: ', total);
    }

    // Agregar los campos de dependencias a los registros
    registros = registros.map((registro: any) => {
      const idDependencia = registro.id_cargo?.id_dependencia;
      const idUnidad = registro.id_cargo?.id_unidad;

      // Buscar la dependencia que coincide con `id_cargo.id_dependencia`
      const dependencia = dependencias.find(
        (dep: any) => dep._id === idDependencia,
      );

      // Si se encuentra la dependencia, agregar los campos
      if (dependencia) {
        registro.id_cargo.id_dependencia = {
          ...dependencia,
        };
      }

      // Buscar la dependencia que coincide con `id_cargo.id_dependencia`
      const unidad = unidades.find((dep: any) => dep._id === idUnidad);

      // Si se encuentra la dependencia, agregar los campos
      if (unidad) {
        registro.id_cargo.id_unidad = {
          _id: registro.id_cargo.id_unidad,
          nombre: unidad.nombre,
        };
      }

      return registro;
    });

    //Agregar a cada solicitud el id_registro correspondiente de registros
    this.solicitudes =
      this.solicitudes.length > 0
        ? this.solicitudes.map((solicitud: any) => {
            // Buscar el registro correspondiente basado en el _id
            const registro = registros.find(
              (reg: any) => reg._id === solicitud.id_registro,
            );

            // Si se encuentra el registro, reemplazar id_registro por el objeto completo
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
      // //console.log('Paso 2: contratosItem: ', contratosItem);
      if (contratosItem.length > 1) {
        fechaIngreso = this.calcularFechaIngreso(contratosItem);
        //console.log('Paso 3: fechaIngreso (true): ', fechaIngreso);
      } else if (contratosItem.length === 1) {
        fechaIngreso = new Date(contratosItem[0].fecha_ingreso);
        //console.log('Paso 3: fechaIngreso (false): ', fechaIngreso);
      }

      fechaVacacionActual = fechaIngreso;
      fechaVacacionAnterior = fechaIngreso;

      if (contratosItem.length > 0) {
        const fechaActual = new Date();
        // Calcular años de servicio
        añosServicio = fechaActual.getFullYear() - fechaIngreso.getFullYear();

        // Ajustar por diferencia de meses y días para corroborar, debe cumplir un año y un día almenos para obtener beneficio vacacional, si no cumple el año entonces restamos.
        // Crear una fecha que represente "un año y un día" después de `fechaIngreso`
        let fechaLimite = new Date(fechaIngreso);
        fechaLimite.setFullYear(fechaLimite.getFullYear() + añosServicio);
        // Un día extra pero debe cumplir el dia extra por tanto el segundo dia extra podrá realizar la solicitud y habrá cumplido un año para resivir sus beneficios
        fechaLimite.setDate(fechaLimite.getDate() + 2);

        // Verificar si la fecha actual aún no ha alcanzado el año y un día
        if (fechaActual < fechaLimite) {
          añosServicio--;
        }
        //console.log('Paso 4: añosServicio: ', añosServicio);

        // Calcular días de vacaciones en función de los años de servicio
        if (añosServicio > 0) {
          if (añosServicio === 1) {
            diasVacacionesActual = 15;
          } else if (añosServicio <= 5) {
            // Hasta el quinto año, 15 días anuales
            diasVacacionesActual = 15;
            diasVacacionesAnterior = 15;
          } else if (añosServicio === 6) {
            diasVacacionesActual = 20;
            diasVacacionesAnterior = 15;
          } else if (añosServicio >= 7 && añosServicio <= 10) {
            // A partir del sexto año, 20 días anuales
            // Vacaciones acumuladas de los últimos dos años
            diasVacacionesActual = 20;
            diasVacacionesAnterior = 20;
          } else if (añosServicio === 11) {
            // A partir del 11avo año, 30 dias anuales
            diasVacacionesActual = 30;
            diasVacacionesAnterior = 20;
          } else {
            diasVacacionesActual = 30;
            diasVacacionesAnterior = 30;
          }

          // Calcular fecha para filtrado de solicitudes para funcionarios que cumplieron más de dos años

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

          //console.log('Paso 5: vacacionActual: ', diasVacacionesActual);
          //console.log('Paso 5: vacacionAnterior: ', diasVacacionesAnterior);
          //console.log('Paso 6: fechaActual:', nuevaFechaVacacionActual);
          //console.log('Paso 6: fechaAnterior:', nuevaFechaVacacionAnterior);

          let vacacion = [
            {
              gestion: nuevaFechaVacacionActual,
              dias: diasVacacionesActual,
            },
          ];
          //Si existe año anterior será distinto de 0
          if (diasVacacionesAnterior !== 0) {
            vacacion.push({
              gestion: nuevaFechaVacacionAnterior,
              dias: diasVacacionesAnterior,
            });
          }

          //console.log('Paso 7: vacacion: ', vacacion);

          diasUsados = this.calcularDiasSolicitudes(vacacion);
          diasGestionActual =
            diasVacacionesActual - diasUsados?.diasGestionActual;
          diasGestionAnterior =
            diasVacacionesAnterior - diasUsados.diasGestionAnterior;

          //   console.log('Paso 11: diasGestionActual: ', diasGestionActual);
          //   console.log('Paso 11: diasGestionAnterior: ', diasGestionAnterior);

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
          //console.log('Paso 12: diasGestion: ', diasGestion);
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

    // console.log('Paso 8: solicitudActual: ', solicitudActual);
    // console.log(
    //   'Paso 8: gestionActual: ',
    //   new Date(solicitudActual[0]?.gestion)
    // );
    // console.log(
    //   'Paso 8: vacacionGestionActual: ',
    //   new Date(vacacion[0]?.gestion)
    // );

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

      //   console.log('Paso 9: solicitudAnterior: ', solicitudAnterior);
      //   console.log(
      //     'Paso 9: gestionAnterior: ',
      //     new Date(solicitudAnterior[0]?.gestion)
      //   );
      //   console.log(
      //     'Paso 9: vacacionGestionActual: ',
      //     new Date(vacacion[1]?.gestion)
      //   );

      // Filtrar solicitudes aprobadas cuya fecha de gestión pertenezcan a dicha gestion
    }

    // Sumar los valores de `dias_totales` de las solicitudes filtradas
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
    // console.log('Paso 10: totalDiasActual: ', totalDiasActual);
    // console.log('Paso 10: toalDiasAnterior: ', totalDiasAnterior);
    //console.log('Total de días de solicitudes aprobadas:', totalDias);
    return {
      diasGestionActual: totalDiasActual,
      diasGestionAnterior: totalDiasAnterior,
    };
  }

  calcularFechaIngreso(contratosItem: any) {
    if (contratosItem.length === 0) return null;

    // Inicializar la variable para almacenar la fecha de inicio continua
    let fechaInicioContinua = new Date(contratosItem[0].fecha_ingreso);
    let fechaFinAnterior = new Date(contratosItem[0].fecha_conclusion);

    for (let i = 1; i < contratosItem.length; i++) {
      const fechaIngresoActual = new Date(contratosItem[i].fecha_ingreso);
      const fechaFinActual = new Date(contratosItem[i].fecha_conclusion);

      // Verificar si hay continuidad (1 día de diferencia entre fecha_fin anterior y fecha_inicio actual)
      const diferenciaDias =
        (fechaIngresoActual.getTime() - fechaFinAnterior.getTime()) /
        (1000 * 60 * 60 * 24);

      if (diferenciaDias > 1) {
        // Si no hay continuidad, restablecer la fecha de inicio continua
        fechaInicioContinua = fechaIngresoActual;
      }

      // Actualizar la fecha de fin anterior para la siguiente iteración
      fechaFinAnterior = fechaFinActual;
    }
    return fechaInicioContinua;
  }
}
