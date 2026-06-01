import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QrService } from '../../services/qr.service';

@Component({
  selector: 'app-validador-qr',
  templateUrl: './validador-qr.component.html',
  styleUrls: ['./validador-qr.component.scss'],
})
export class ValidadorQrComponent implements OnInit {
  isLoading = true;
  isValid = false;
  errorMessage = '';
  qrData: any = null;
  recursoData: any = null;
  infoLegal: string[] = [];
  fechaVerificacion: Date | null = null;

  constructor(
    private route: ActivatedRoute,
    private qrService: QrService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const codigoHash = params.get('codigoHash');
      if (codigoHash) {
        this.validar(codigoHash);
      } else {
        this.isLoading = false;
        this.isValid = false;
        this.errorMessage = 'CÓDIGO NO PROPORCIONADO';
      }
    });
  }

  validar(codigoHash: string): void {
    this.isLoading = true;
    this.qrService.validarQr(codigoHash).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.valido) {
          this.isValid = true;
          this.qrData = res.qr;
          this.recursoData = res.recurso;
          this.infoLegal = res.infoLegal || [];
          this.fechaVerificacion = res.fechaVerificacion
            ? new Date(res.fechaVerificacion)
            : new Date();
        } else {
          this.isValid = false;
          this.errorMessage = res.message || 'QR_NO_VALIDO';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.isValid = false;
        this.errorMessage = 'ERROR_DE_CONEXION';
        console.error(err);
      },
    });
  }
}
