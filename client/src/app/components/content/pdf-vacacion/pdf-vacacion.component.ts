import { Component, OnInit } from '@angular/core';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-pdf-vacacion',
  templateUrl: './pdf-vacacion.component.html',
  styleUrl: './pdf-vacacion.component.scss',
})
export class PdfVacacionComponent implements OnInit {
  apellidos = 'Perez';
  nombres = 'Juan';
  documento = '12345678';
  cargo = 'Analista';
  dependencia = 'Recursos Humanos';
  unidad = 'Unidad de Personal';
  telefono = '123456789';
  email = 'juan.perez@example.com';
  diasSolicitados = '5';
  motivo = 'Motivo de Ejemplo';

  ngOnInit() {
    this.generatePDF;
  }

  async generatePDF() {
    const pdfDoc = await PDFDocument.create();

    const verdanaBytes = await fetch('/assets/fonts/verdana.ttf').then((res) =>
      res.arrayBuffer(),
    );
    const verdanaFont = await pdfDoc.embedFont(verdanaBytes);

    const page = pdfDoc.addPage([595.28, 841.89]);

    const fontSize = 12;
    const color = rgb(0, 0, 0);

    page.drawText('SOLICITUD DE PERMISO', {
      x: 200,
      y: 800,
      size: 16,
      font: verdanaFont,
      color,
    });

    page.drawText('VERSION: 1', {
      x: 450,
      y: 780,
      size: fontSize,
      font: verdanaFont,
      color,
    });
    page.drawText('CODIGO: FOR-RH-001', {
      x: 450,
      y: 765,
      size: fontSize,
      font: verdanaFont,
      color,
    });
    page.drawText('FECHA: 14/10/2019', {
      x: 450,
      y: 750,
      size: fontSize,
      font: verdanaFont,
      color,
    });

    const options = [
      'A Cuenta de Vacación',
      'Sin Goce de Haber',
      'Licencia',
      'Tolerancia',
      'Capacitación',
      'Otros Permisos Oficiales',
    ];

    options.forEach((option, index) => {
      page.drawText(`☐ ${option}`, {
        x: 50,
        y: 720 - index * 20,
        size: fontSize,
        font: verdanaFont,
        color,
      });
    });

    const data = [
      `Apellidos: ${this.apellidos}`,
      `Nombres: ${this.nombres}`,
      `No. Documento de Identidad: ${this.documento}`,
      `Cargo que Desempeña: ${this.cargo}`,
      `Dependencia: ${this.dependencia}`,
      `Unidad: ${this.unidad}`,
      `Teléfono de Contacto: ${this.telefono}`,
      `E-mail: ${this.email}`,
      `Días Solicitados: ${this.diasSolicitados}`,
      `Motivo del Permiso: ${this.motivo}`,
    ];

    data.forEach((text, index) => {
      page.drawText(text, {
        x: 50,
        y: 600 - index * 20,
        size: fontSize,
        font: verdanaFont,
        color,
      });
    });

    page.drawText('Firma del Solicitante: _____________________', {
      x: 50,
      y: 300,
      size: fontSize,
      font: verdanaFont,
      color,
    });
    page.drawText('Firma de Aprobación: _____________________', {
      x: 50,
      y: 280,
      size: fontSize,
      font: verdanaFont,
      color,
    });

    page.drawText(
      '* Todos los campos marcados con asterisco son obligatorios.',
      {
        x: 50,
        y: 100,
        size: 10,
        font: verdanaFont,
        color: rgb(0.5, 0.5, 0.5),
      },
    );

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    saveAs(blob, 'solicitud_de_permiso.pdf');
  }
}
