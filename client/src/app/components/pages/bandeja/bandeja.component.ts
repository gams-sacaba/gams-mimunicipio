import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  Input,
  ChangeDetectorRef,
} from '@angular/core';
import { Subscription } from 'rxjs';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

import { convertirFechaISO } from '../../../utils/utils';
import { AuthService } from '../../../services/auth.service';
import { SolicitudesService } from '../../../services/solicitudes.service';
import { SocketService } from '../../../services/socket.service';
import { FormHoraComponent } from '../../layout/form-hora/form-hora.component';
import { FormFechaComponent } from '../../layout/form-fecha/form-fecha.component';
import {
  getColor,
  getIncialesMayuscula,
  adjustPageSize,
} from '../../../utils/utils';

@Component({
  selector: 'app-bandeja',
  templateUrl: './bandeja.component.html',
  styleUrl: './bandeja.component.scss',
})
export class BandejaComponent implements OnInit, OnDestroy {
  _idRegistro: any;
  solicitudes: any = [];
  displayedColumns: string[] = [
    'id',
    'nombre',
    'contrato',
    'solicitud',
    'fecha',
    'estado',
    'option',
  ];

  cargo: string = '';
  nombre: string = '';
  contrato: string = '';
  datosGenerales: any = {};
  dataSource = new MatTableDataSource<any>([]);

  private solicitudUpdateToApproverSubscription: any = Subscription;

  private categorias: any[] = ['HORA', 'FECHA', 'RANGO', 'CALENDARIO'];

  id_cargo_aprobador: any;

  @Input() public data: any;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  constructor(
    private dialog: MatDialog,
    private solicitudService: SolicitudesService,
    private authService: AuthService,
    private socketService: SocketService,
    private cdr: ChangeDetectorRef,
  ) {
    this._idRegistro = this.authService.getUserRegistro().toString();
    this.id_cargo_aprobador = this.authService.getIsAprobador().toString();
  }

  ngAfterViewInit(): void {
    this.visualizacionDatasource();
    this.cdr.detectChanges();
  }
  ngOnInit(): void {
    this.load();

    this.solicitudUpdateToApproverSubscription =
      this.socketService.solicitudUpdateToApprover$.subscribe(
        (updatedSolicitud) => {
          if (!updatedSolicitud) return;

          if (updatedSolicitud.estado !== 'ENVIADO') {
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
    if (this.solicitudUpdateToApproverSubscription) {
      this.solicitudUpdateToApproverSubscription.unsubscribe();
    }
  }

  async load() {
    try {
      this.solicitudes =
        (await this.solicitudService
          .getFiltroElementos(
            'id_cargo_aprobador',
            this.id_cargo_aprobador,
            'bandeja',
          )
          .toPromise()) || [];
    } catch (err) {}

    this.dataSource = new MatTableDataSource(this.solicitudes);
    this.dataSource.paginator = this.paginator;
  }

  fechaConvert(element: any) {
    return convertirFechaISO(element);
  }

  categoriaFecha(element: any) {
    console.log(element);
    const dialogRef = this.dialog.open(FormFechaComponent, {
      data: element,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.load();
      }
    });
  }

  categoriaHora(element: any) {
    const dialogRef = this.dialog.open(FormHoraComponent, {
      data: element,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.load();
      }
    });
  }

  editarSolicitud(element: any, status: boolean) {
    console.log('editarSolicitud: ', element);
    element.editar = true;
    element.esAprobador = true;
    element.esDetalle = true;
    element.esVista = true;
    element.estadoAprobador = 'PENDIENTE';
    element._idRegistroAprobador = this._idRegistro;
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

  getColors(contrato: string): string {
    const color = getColor(contrato);
    return getColor(contrato);
  }

  capitalizeFirst(text: string): string {
    return getIncialesMayuscula(text);
  }

  private visualizacionDatasource() {
    adjustPageSize(this.paginator, this.dataSource);

    window.addEventListener('resize', () => {
      adjustPageSize(this.paginator, this.dataSource);
    });

    this.dataSource.paginator = this.paginator;
  }
}
