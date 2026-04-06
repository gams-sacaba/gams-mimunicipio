import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../../services/auth.service';

import { FuncionariosService } from '../../../services/funcionarios.service';
import { RegistrosService } from '../../../services/registros.service';
import { UpdateService } from '../../../services/update.service';
import { ContenidosService } from '../../../services/contenidos.service';
import { SocketService } from '../../../services/socket.service';

import { FormVacacionComponent } from '../form-vacacion/form-vacacion.component';
import { FormFechaComponent } from '../form-fecha/form-fecha.component';
import { FormHoraComponent } from '../form-hora/form-hora.component';

interface Card {
  title: string;
  btn: string;
  casos: string;
  descripcion: string;
  selection: number;
}

@Component({
  selector: 'app-solicitud-card',
  templateUrl: './solicitud-card.component.html',
  styleUrls: ['./solicitud-card.component.scss'],
})
export class SolicitudCardComponent implements OnChanges, OnDestroy, OnInit {
  private _id: string;
  _idRegistro: any;
  idName: any;
  contenidos: any[] = [];
  id_funcionario: any;
  totalDias: any;
  diasDisponibles: any;
  diasDisponiblesActual: any;
  diasDisponiblesAnterior: any;
  diasGestionActual: any;
  diasGestionAnterior: any;

  private contenidoUpdateSubscription: any = Subscription;

  @Input() public data: any;
  constructor(
    private authService: AuthService,
    private contenidoService: ContenidosService,
    private funcionarioService: FuncionariosService,
    private registroService: RegistrosService,
    private udpateService: UpdateService,
    private socketService: SocketService,
    private dialog: MatDialog,
  ) {
    this._id = this.authService.getUserFuncionario().toString();
    this._idRegistro = this.authService.getUserRegistro().toString();
  }

  ngOnInit(): void {
    this.contenidoUpdateSubscription =
      this.socketService.contenidoUpdate$.subscribe(() => {
        this.load();
      });

    this.socketService.solicitudUpdatedToUser$.subscribe((payload) => {
      if (payload && payload.action === 'HIDE_CU') {
        this.load();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.load();
  }

  ngOnDestroy(): void {
    if (this.contenidoUpdateSubscription) {
      this.contenidoUpdateSubscription.unsubscribe();
    }
  }

  async load() {
    const colores = [
      'primary',
      'accent',
      'warn',
      'info',
      'success',
      'warning',
      'purple',
      'teal',
      'orange',
      'blue',
      'pink',
      'lime',
      'cyan',
      'indigo',
      'brown',
      'grey',
      'lightblue',
      'deeporange',
      'deeppurple',
      'amber',
    ];
    try {
      this.contenidos = await this.contenidoService
        .getContenidos({ id: this._id })
        .toPromise();
    } catch (err) {
      console.error('Error cargando contenidos', err);
    }

    this.contenidos = this.contenidos.map((card, index) => ({
      ...card,
      btn: colores[index % colores.length],
    }));
  }

  solicitud(selection: any) {
    selection.id_registro = this._idRegistro;
    selection.esVista = true;
    console.log('seleccion: ', selection);
    if (this.data) {
      switch (selection?.categoria) {
        case 'CALENDARIO':
          this.solicitudVacacion(this.data);
          break;
        case 'FECHA':
          this.categoriaFecha(selection);
          break;
        case 'HORA':
          this.categoriaHora(selection);
          break;
      }
    }
  }

  categoriaFecha(contenido: any) {
    console.log('crear: ', contenido);
    const dialogRef = this.dialog.open(FormFechaComponent, {
      data: contenido,
      maxWidth: '450px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.udpateService.updateElement();
      }
    });
  }

  async solicitudVacacion(element: any) {
    let data: any;
    let gestionActual: any;
    let gestionAnterior: any;
    let solicitudActual: any = [];
    let solicitudAnterior: any = [];

    gestionActual = new Date(element?.diasVacaciones[0]?.gestion);
    gestionAnterior =
      element.diasVacaciones && element.diasVacaciones.length === 2
        ? new Date(element?.diasVacaciones[1]?.gestion)
        : '';

    solicitudActual =
      element.solicitudes.length > 0
        ? element.solicitudes.filter(
            (solicitud: any) =>
              solicitud.tipo === 'VA' &&
              solicitud.estado !== 'RECHAZADO' &&
              solicitud.fecha_fin &&
              new Date(solicitud.fecha_envio).getTime() >=
                gestionActual.getTime(),
          )
        : [];

    solicitudAnterior =
      gestionAnterior !== ''
        ? element.solicitudes.filter(
            (solicitud: any) =>
              solicitud.tipo === 'VA' &&
              solicitud.estado !== 'RECHAZADO' &&
              solicitud.fecha_fin &&
              new Date(solicitud.fecha_envio).getTime() >=
                gestionAnterior.getTime() &&
              new Date(solicitud.fecha_envio).getTime() <
                gestionActual.getTime(),
          )
        : [];

    if (solicitudAnterior.length > 0) {
      solicitudActual.push(solicitudAnterior[0]);
    }

    if (solicitudActual.length === 1 && element.diasVacaciones.length >= 2) {
      if (
        new Date(solicitudActual[0].gestion).getTime() ===
        new Date(element.diasVacaciones[0].gestion).getTime()
      ) {
        solicitudActual.push({
          dias: [],
          dias_totales: 0,
          gestion: this.data?.diasVacaciones[1].gestion,
          tipo: 'VA',
          estado: 'PENDIENTE',
        });
      } else {
        solicitudActual.unshift({
          dias: [],
          dias_totales: 0,
          gestion: this.data?.diasVacaciones[0].gestion,
          tipo: 'VA',
          estado: 'PENDIENTE',
        });
      }
    }

    const unidad = this.data.id_cargo.id_unidad._id;

    const personal = await this.registroService
      .getFiltroElementos('id_cargo', 'id_unidad', unidad)
      .toPromise();

    const elementosFiltrados = (personal ?? []).filter(
      (element: any) => element.estado === true && element.id_funcionario,
    );

    const personalActivo = elementosFiltrados.length
      ? await Promise.all(
          elementosFiltrados.map(async (element: any) => {
            const datoFuncionario = await this.funcionarioService
              .getFuncionarioById(element.id_funcionario?._id)
              .toPromise();
            return {
              ...element,
              datosFuncionario: datoFuncionario,
            };
          }),
        )
      : [];

    data = {
      _id: element.id_registro,
      solicitudActual: solicitudActual,
      solicitudAnterior: solicitudAnterior,
      diasVacaciones: element.diasVacaciones,
      personal: personalActivo,
    };

    const dialogRef = this.dialog.open(FormVacacionComponent, {
      data: data,
      maxWidth: '950px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.udpateService.updateElement();
      }
    });
  }

  categoriaHora(contenido: any) {
    console.log('crear: ', contenido);
    const dialogRef = this.dialog.open(FormHoraComponent, {
      data: contenido,
      maxWidth: '950px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.udpateService.updateElement();
      }
    });
  }
}
