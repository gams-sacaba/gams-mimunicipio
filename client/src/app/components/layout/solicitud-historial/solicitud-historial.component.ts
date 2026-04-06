import { Component, OnInit, OnDestroy, ViewChild, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

import { convertirFechaISO } from '../../../utils/utils';
import { AuthService } from '../../../services/auth.service';
import { SolicitudesService } from '../../../services/solicitudes.service';
import { SocketService } from '../../../services/socket.service';
import { FormFechaComponent } from '../form-fecha/form-fecha.component';
import { FormHoraComponent } from '../form-hora/form-hora.component';

@Component({
  selector: 'app-solicitud-historial',
  templateUrl: './solicitud-historial.component.html',
  styleUrl: './solicitud-historial.component.scss',
})
export class SolicitudHistorialComponent implements OnInit, OnDestroy {
  _idRegistro: any;
  solicitudes: any = [];
  displayedColumns: string[] = [
    'id',

    'solicitud',
    'fecha',
    'trayectoria',
    'estado',
    'option',
  ];

  cargo: string = '';
  nombre: string = '';
  contrato: string = '';
  datosGenerales: any = {};
  dataSource = new MatTableDataSource<any>([]);

  private solicitudUpdatedToUserSubscription: any = Subscription;

  private categorias: any[] = ['HORA', 'FECHA', 'RANGO', 'CALENDARIO'];

  @Input() public data: any;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  constructor(
    private dialog: MatDialog,
    private solicitudService: SolicitudesService,
    private authService: AuthService,
    private socketService: SocketService,
  ) {
    this._idRegistro = this.authService.getUserRegistro().toString();
  }
  ngOnInit(): void {
    this.load();

    this.solicitudUpdatedToUserSubscription =
      this.socketService.solicitudUpdatedToUser$.subscribe(
        (updatedSolicitud) => {
          if (!updatedSolicitud) return;

          if (updatedSolicitud.deleted) {
            this.solicitudes = this.solicitudes.filter(
              (s: any) => s._id !== updatedSolicitud._id,
            );
          } else {
            const index = this.solicitudes.findIndex(
              (s: any) => s._id === updatedSolicitud._id,
            );
            if (index !== -1) {
              this.solicitudes[index] = updatedSolicitud;
            } else {
              this.solicitudes.unshift(updatedSolicitud);
            }
          }

          this.dataSource.data = this.solicitudes;
        },
      );
  }

  ngOnDestroy(): void {
    if (this.solicitudUpdatedToUserSubscription) {
      this.solicitudUpdatedToUserSubscription.unsubscribe();
    }
  }

  async load() {
    try {
      this.solicitudes =
        (await this.solicitudService
          .getFiltroElementos('id_registro', this._idRegistro, 'solicitudes')
          .toPromise()) || [];
    } catch (err) {
      console.error();
    }

    this.dataSource = new MatTableDataSource(this.solicitudes);
    this.dataSource.paginator = this.paginator;
  }

  fechaConvert(element: any) {
    return convertirFechaISO(element);
  }

  categoriaFecha(element: any) {
    this.dialog.open(FormFechaComponent, {
      data: element,
    });
  }

  categoriaHora(element: any) {
    this.dialog.open(FormHoraComponent, {
      data: element,
    });
  }

  editarSolicitud(element: any, status: boolean) {
    element.editar = true;
    element.esDetalle = status;
    element.esVista = !status;
    if (status) {
    }
    const categoria = element?.id_contenido?.categoria || '';
    if (this.categorias.includes(categoria)) {
      switch (categoria) {
        case 'CALENDARIO':
          break;
        case 'RANGO':
          break;
        case 'FECHA':
          this.categoriaFecha(element);
          break;
        case 'HORA':
          this.categoriaHora(element);
          break;
      }
    } else {
    }
  }

  capitalizeFirst(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }
}
