import { Component, OnInit } from '@angular/core';
import { DetallesService } from '../../../services/detalles.service';
import { AuthService } from '../../../services/auth.service';
import { FuncionariosService } from '../../../services/funcionarios.service';
import { convertirFecha } from '../../../utils/utils';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-datos',
  templateUrl: './datos.component.html',
  styleUrls: ['./datos.component.scss'],
})
export class DatosComponent implements OnInit {
  personal: any = {};
  profesional: any = {};
  documentos: any = {};
  certificados: any = {};
  declaracion: any = {};
  licencias: any = {};
  institucional: any = {};
  discapacidad: any = {};
  diplomados: string[] = [];

  experienciaOptions: string[] = [
    '1 AÑO',
    '1 A 2 AÑOS',
    '1 A 3 AÑOS',
    '1 A 4 AÑOS',
    '1 A 5 AÑOS',
    '5+ AÑOS',
  ];

  private _id: string;
  data: any;
  detalle: any[] = [];

  permissions: string[] = [];
  constructor(
    private authService: AuthService,
    private detalleService: DetallesService,
    private funcionarioService: FuncionariosService
  ) {
    this._id = this.authService.getUserFuncionario().toString();
    this.authService.getAccessibleModules().subscribe((modules: any) => {
      if (modules && modules['datos']) {
        this.permissions = modules['datos'];
      }
    });
  }

  async ngOnInit() {
    await this.load();
  }

  async load() {
    try {
      this.detalle = await firstValueFrom(
        this.detalleService.getFiltroCampos('id_funcionario', this._id)
      );
    } catch {
      this.detalle = [];
    }

    try {
      this.data = await firstValueFrom(
        this.funcionarioService.getFuncionarioById(this._id)
      );
    } catch {
      this.data = null;
    }

    this.loadData();
  }

  loadData() {
    const detalle = this.detalle[0];
    const funcionario = this.data?.funcionario;
    if (!detalle || !funcionario) return;

    const nombre = `${funcionario.nombre || ''} ${funcionario.paterno || ''} ${
      funcionario.materno || ''
    } ${funcionario.casada || ''}`.trim();
    const ci = `${funcionario.ci || ''} ${funcionario.ext || ''}`.trim();

    this.personal = {
      nombre,
      ci,
      genero: funcionario.genero || '',
      fecha: funcionario.fecha_nacimiento
        ? this.fechaConvert(funcionario.fecha_nacimiento)
        : '',
      telefono: funcionario.telefono || '',
      hijos: detalle.hijos || 0,
      madre: detalle.madre || '',
      padre: detalle.padre || '',
    };

    this.profesional = {
      grado: detalle.grado || 'NINGUNO',
      titulo: detalle.titulo || 'NINGUNO',
      egreso: detalle.egreso || 'NO',
      estudio: detalle.estudio || 'NO',
      diploma: detalle.diploma || 'NO',
      fotocopia: detalle.fotocopia || 'NO',
      experiencia: detalle.experiencia || '',
    };

    const has = (arr: string[], val: string) => arr?.includes(val) || false;

    this.documentos = {
      DJ: has(detalle.documentos, 'DJ'),
      REJAP: has(detalle.documentos, 'REJAP'),
      CENVI: has(detalle.documentos, 'CENVI'),
      LB: has(detalle.documentos, 'LB'),
      HV: has(detalle.documentos, 'HV'),
      CN: has(detalle.documentos, 'CN'),
      CD: has(detalle.documentos, 'CD'),
    };

    this.certificados = {
      QUECHUA: has(detalle.certificados, 'QUECHUA'),
      '1178': has(detalle.certificados, '1178'),
      PB: has(detalle.certificados, 'PB'),
      RFP: has(detalle.certificados, 'RFP'),
    };

    this.declaracion = {
      IDP: has(detalle.ddjj, 'IDP'),
      GP: has(detalle.ddjj, 'GP'),
    };

    this.licencias = {
      M: has(detalle.licencias, 'M'),
      P: has(detalle.licencias, 'P'),
      T: has(detalle.licencias, 'T'),
      A: has(detalle.licencias, 'A'),
      B: has(detalle.licencias, 'B'),
      C: has(detalle.licencias, 'C'),
    };

    this.diplomados = detalle.diplomados || [];

    this.institucional = {
      ficha: detalle.ficha || 'NO',
      sanciones: detalle.sanciones || 0,
      caja: detalle.caja || 'NO',
      evaluacion: detalle.evaluacion || 'NO',
      servicio: detalle.servicio || 0,
      registro: detalle.registro || 'NO',
    };

    this.discapacidad = { discapacidad: detalle.discapacidad || 'NO' };
  }

  fechaConvert(element: any) {
    return convertirFecha(element);
  }
}
