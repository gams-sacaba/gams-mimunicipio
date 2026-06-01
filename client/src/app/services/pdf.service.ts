import { Injectable } from '@angular/core';
import { PDFDocument, rgb } from 'pdf-lib';
import * as fontkit from 'fontkit';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  constructor() {}

  async generateVacacion(
    datosGenerales: any,
    element: any,
    vacaciones: any,
    reemplazo: any,
  ) {
    const nombres = datosGenerales.nombres || '';
    const apellidos = datosGenerales.apellidos || '';
    const ci = datosGenerales.ci || '';
    const telefono = datosGenerales.telefono || '';
    const cargo = datosGenerales.cargo || '';
    const registro = datosGenerales.registro || '';
    const unidad = datosGenerales.unidad || '';
    const dependencia = datosGenerales.dependencia || '';

    const dias = element.dias.map((dia: any) => {
      const fechaISO = dia.fecha.split('T')[0];
      const [anio, mes, diaNum] = fechaISO.split('-');

      const formato = `${diaNum}/${mes}/${anio}`;

      return {
        ...dia,
        fechaFormateada: formato,
      };
    });

    vacaciones =
      vacaciones.length > 0
        ? vacaciones.map((vacacion: any) => {
            const fecha = new Date(vacacion.gestion);
            const formato = fecha.toLocaleDateString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            });

            return {
              ...vacacion,
              gestionFormateada: formato,
            };
          })
        : [];

    const dias_solicitados = element.dias_totales || '';
    const fecha_actual =
      vacaciones.length > 0 ? vacaciones[0].gestionFormateada : '';
    const fecha_pasada =
      vacaciones.length > 0 ? vacaciones[1].gestionFormateada : '';

    const saldo_gestion_actual =
      vacaciones.length > 0 ? vacaciones[0].diasDisponibles : 0;
    const saldo_gestion_pasada =
      vacaciones.length === 2 ? vacaciones[1].diasDisponibles : 0;

    const dias_disponibles = saldo_gestion_pasada + saldo_gestion_actual;

    const nombresReemplazo = reemplazo.nombres || '';
    const apellidosReemplazo = reemplazo.apellidos || '';
    const cargoReemplazo = reemplazo.cargo || '';
    const ciReemplazo = reemplazo.ci || '';
    const telefonoReemplazo = reemplazo.telefono
      ? reemplazo.telefono.toString()
      : '';
    const fechaSolicitud = this.formatearFecha(element.fecha_envio) || '';

    const sizeTitle = 12;
    const sizeNormal = 7;
    const sizeMinimun = 6;
    const squareSize = 15;
    const pdfDoc = await PDFDocument.create();

    const cellHeight = 15;

    pdfDoc.registerFontkit(fontkit);

    const verdanaBytes = await fetch('/assets/fonts/verdana.ttf').then((res) =>
      res.arrayBuffer(),
    );
    const verdanaFont = await pdfDoc.embedFont(verdanaBytes);

    const verdanaBoldBytes = await fetch('/assets/fonts/verdana-bold.ttf').then(
      (res) => res.arrayBuffer(),
    );
    const verdanaBoldFont = await pdfDoc.embedFont(verdanaBoldBytes);

    const page = pdfDoc.addPage([595.28, 841.89]);

    const margin = 28.35;
    const pageWidth = page.getWidth();
    const pageHeight = page.getHeight();

    const rowHeight = 45;
    const columnWidth = (pageWidth - 2 * margin) / 3;

    page.drawRectangle({
      x: margin,
      y: pageHeight - margin - rowHeight,
      width: pageWidth - 2 * margin,
      height: rowHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
      color: rgb(1, 1, 1),
    });

    const logoBytes = await fetch('/assets/img/logo.png').then((res) =>
      res.arrayBuffer(),
    );
    const logoImage = await pdfDoc.embedPng(logoBytes);
    const logoDims = logoImage.scale(0.1);
    page.drawImage(logoImage, {
      x: margin + 5,
      y: pageHeight - margin - rowHeight + 5,
      width: logoDims.width,
      height: logoDims.height,
    });

    const titleText = 'SOLICITUD DE VACACIONES';
    const titleHeight = verdanaBoldFont.heightAtSize(12);
    page.drawText(titleText, {
      x: margin + columnWidth,
      y: pageHeight - margin - rowHeight + (rowHeight - titleHeight) / 2,
      size: sizeTitle,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    const codeText = 'FOR-RH-001';
    const codeWidth = verdanaFont.widthOfTextAtSize(codeText, 8);
    page.drawText(codeText, {
      x: margin + 2 * columnWidth + columnWidth - codeWidth - 30,
      y: pageHeight - margin - 15,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    const codeDate = 'FECHA: ' + fechaSolicitud;
    const codeDateWith = verdanaFont.widthOfTextAtSize(codeDate, 8);
    page.drawText(codeDate, {
      x: margin + 2 * columnWidth + columnWidth - codeDateWith,
      y: pageHeight - margin - 35,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    const datosGeneralesRowY = pageHeight - margin - rowHeight - 14.7;
    const datosGeneralesRowWidth = pageWidth - 2 * margin;

    page.drawRectangle({
      x: margin,
      y: datosGeneralesRowY,
      width: datosGeneralesRowWidth,
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    const datosGeneralesText = 'DATOS GENERALES';
    const datosGeneralesTextWidth = verdanaBoldFont.widthOfTextAtSize(
      datosGeneralesText,
      9,
    );

    page.drawText(datosGeneralesText, {
      x: margin + (datosGeneralesRowWidth - datosGeneralesTextWidth) / 2,
      y: datosGeneralesRowY + (cellHeight - 9) / 2 + 2,
      size: sizeNormal,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    const rowDatosGeneralesY = datosGeneralesRowY - cellHeight;

    const columnWidths = [45, 110, 46, 150, 25, 64, 45, 53.5];

    const drawCellWithText = (
      label: string,
      xPos: number,
      yPos: number,
      cellWidth: number,
    ) => {
      page.drawRectangle({
        x: xPos,
        y: yPos,
        width: cellWidth,
        height: cellHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });

      page.drawText(label, {
        x: xPos + 5,
        y: yPos + (cellHeight - sizeNormal) / 2,
        size: sizeNormal,
        font: verdanaFont,
        color: rgb(0, 0, 0),
      });
    };

    let xPos = margin;

    drawCellWithText('Nombres:', xPos, rowDatosGeneralesY, columnWidths[0]);
    xPos += columnWidths[0];

    drawCellWithText(nombres, xPos, rowDatosGeneralesY, columnWidths[1]);
    xPos += columnWidths[1];

    drawCellWithText('Apellidos:', xPos, rowDatosGeneralesY, columnWidths[2]);
    xPos += columnWidths[2];

    drawCellWithText(apellidos, xPos, rowDatosGeneralesY, columnWidths[3]);
    xPos += columnWidths[3];

    drawCellWithText('C.I.:', xPos, rowDatosGeneralesY, columnWidths[4]);
    xPos += columnWidths[4];

    drawCellWithText(ci, xPos, rowDatosGeneralesY, columnWidths[5]);
    xPos += columnWidths[5];

    drawCellWithText('Teléfono:', xPos, rowDatosGeneralesY, columnWidths[6]);
    xPos += columnWidths[6];

    drawCellWithText(telefono, xPos, rowDatosGeneralesY, columnWidths[7]);

    const rowCargoY = rowDatosGeneralesY - cellHeight;

    const columnWidthsCargo = [34, pageWidth - 2 * margin - 34];

    page.drawRectangle({
      x: margin,
      y: rowCargoY,
      width: columnWidthsCargo[0],
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    page.drawText('Cargo:', {
      x: margin + 5,
      y: rowCargoY + (cellHeight - sizeNormal) / 2,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    page.drawRectangle({
      x: margin + columnWidthsCargo[0],
      y: rowCargoY,
      width: columnWidthsCargo[1],
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    page.drawText(this.truncateText(cargo, 139), {
      x: margin + columnWidthsCargo[0] + 5,
      y: rowCargoY + (cellHeight - sizeNormal) / 2,
      size: sizeMinimun,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    const rowRegistroY = rowCargoY - cellHeight;

    const columnWidthsRegistro = [
      41,
      33,
      35,
      324,
      58,
      pageWidth - 2 * margin - 491,
    ];

    page.drawRectangle({
      x: margin,
      y: rowRegistroY,
      width: columnWidthsRegistro[0],
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });
    page.drawText('N° Item:', {
      x: margin + 5,
      y: rowRegistroY + (cellHeight - sizeNormal) / 2,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    page.drawRectangle({
      x: margin + columnWidthsRegistro[0],
      y: rowRegistroY,
      width: columnWidthsRegistro[1],
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });
    page.drawText(`${registro}`, {
      x: margin + columnWidthsRegistro[0] + 5,
      y: rowRegistroY + (cellHeight - sizeNormal) / 2,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    page.drawRectangle({
      x: margin + columnWidthsRegistro[0] + columnWidthsRegistro[1],
      y: rowRegistroY,
      width: columnWidthsRegistro[2],
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });
    page.drawText('Unidad:', {
      x: margin + columnWidthsRegistro[0] + columnWidthsRegistro[1] + 5,
      y: rowRegistroY + (cellHeight - sizeNormal) / 2,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    page.drawRectangle({
      x:
        margin +
        columnWidthsRegistro[0] +
        columnWidthsRegistro[1] +
        columnWidthsRegistro[2],
      y: rowRegistroY,
      width: columnWidthsRegistro[3],
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });
    page.drawText(this.truncateText(unidad, 87), {
      x:
        margin +
        columnWidthsRegistro[0] +
        columnWidthsRegistro[1] +
        columnWidthsRegistro[2] +
        5,
      y: rowRegistroY + (cellHeight - sizeNormal) / 2,
      size: sizeMinimun,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    page.drawRectangle({
      x:
        margin +
        columnWidthsRegistro[0] +
        columnWidthsRegistro[1] +
        columnWidthsRegistro[2] +
        columnWidthsRegistro[3],
      y: rowRegistroY,
      width: columnWidthsRegistro[4],
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });
    page.drawText('Dependencia:', {
      x:
        margin +
        columnWidthsRegistro[0] +
        columnWidthsRegistro[1] +
        columnWidthsRegistro[2] +
        columnWidthsRegistro[3] +
        5,
      y: rowRegistroY + (cellHeight - sizeNormal) / 2,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    page.drawRectangle({
      x:
        margin +
        columnWidthsRegistro[0] +
        columnWidthsRegistro[1] +
        columnWidthsRegistro[2] +
        columnWidthsRegistro[3] +
        columnWidthsRegistro[4],
      y: rowRegistroY,
      width: columnWidthsRegistro[5],
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });
    page.drawText(this.truncateText(dependencia, 25), {
      x:
        margin +
        columnWidthsRegistro[0] +
        columnWidthsRegistro[1] +
        columnWidthsRegistro[2] +
        columnWidthsRegistro[3] +
        columnWidthsRegistro[4] +
        5,
      y: rowRegistroY + (cellHeight - sizeNormal) / 2,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    const detalleRowY = rowDatosGeneralesY - 45;

    const detalleRowXWidth = pageWidth - 2 * margin;

    page.drawRectangle({
      x: margin,
      y: detalleRowY,
      width: detalleRowXWidth,
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    const detalleText = 'DETALLE';
    const detalleTextWidth = verdanaBoldFont.widthOfTextAtSize(detalleText, 9);

    page.drawText(detalleText, {
      x: margin + (detalleRowXWidth - detalleTextWidth) / 2,
      y: detalleRowY + (cellHeight - 9) / 2 + 2,
      size: sizeNormal,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    const row4Y = detalleRowY - 15;

    const cellWidth = (pageWidth - 2 * margin) / 7;

    const headers = [
      'Fecha',
      'Jornada',
      'Turno',
      '',
      'Fecha',
      'Jornada',
      'Turno',
    ];
    headers.forEach((header, index) => {
      if (index === 3) {
        return;
      }
      const xPos = margin + index * cellWidth;
      page.drawText(header, {
        x: xPos + 2,
        y: row4Y + cellHeight - 10,
        size: sizeMinimun,
        font: verdanaBoldFont,
        color: rgb(0, 0, 0),
      });

      page.drawRectangle({
        x: xPos,
        y: row4Y,
        width: cellWidth,
        height: cellHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });
    });

    for (let rowIndex = 0; rowIndex < 20; rowIndex++) {
      const rowY = row4Y - (rowIndex + 1) * cellHeight;

      for (let colIndex = 0; colIndex < 7; colIndex++) {
        const xPos = margin + colIndex * cellWidth;

        if (colIndex === 3) {
          continue;
        }

        const dataIndex = rowIndex + (colIndex < 4 ? 0 : 20);

        const dia = dias[dataIndex];
        let text = '';
        if (dia) {
          text =
            colIndex % 3 === 0
              ? dia.fechaFormateada
              : colIndex % 3 === 1
                ? dia.jornada
                : dia.turno;
        }

        page.drawText(text || '', {
          x: xPos + 2,
          y: rowY + cellHeight - 10,
          size: sizeMinimun,
          font: verdanaFont,
          color: rgb(0, 0, 0),
        });

        page.drawRectangle({
          x: xPos,
          y: rowY,
          width: cellWidth,
          height: cellHeight,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        });
      }
    }

    const rowTotalDiasY = row4Y - 21 * cellHeight - 5;

    page.drawRectangle({
      x: margin,
      y: rowTotalDiasY,
      width: 3 * cellWidth,
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    const totalDiasText = `TOTAL DÍAS SOLICITADOS: `;
    const totalDiasTextWidth = verdanaBoldFont.widthOfTextAtSize(
      totalDiasText,
      7,
    );
    page.drawText(totalDiasText, {
      x: margin + (3 * cellWidth - totalDiasTextWidth) / 2 - 10,
      y: rowTotalDiasY + (cellHeight - 6) / 2,
      size: sizeNormal,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    const totalDiasValue = `${dias_solicitados}`;
    page.drawText(totalDiasValue, {
      x: margin + 3 * cellWidth - totalDiasTextWidth + 40,
      y: rowTotalDiasY + (cellHeight - 6) / 2,
      size: sizeNormal,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    page.drawRectangle({
      x: margin + 4 * cellWidth,
      y: rowTotalDiasY,
      width: 3 * cellWidth,
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    const saldoDiasText =
      vacaciones.length === 2
        ? `Saldo Días Vacación de ` + `${fecha_pasada}: ${saldo_gestion_pasada}`
        : '';

    page.drawText(saldoDiasText, {
      x: margin + 4 * cellWidth + 5,
      y: rowTotalDiasY + (cellHeight - 9) / 2,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    const rowSaldoY = rowTotalDiasY - cellHeight;

    page.drawRectangle({
      x: margin + 4 * cellWidth,
      y: rowSaldoY,
      width: 3 * cellWidth,
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    const saldoDiasText_2 =
      `Saldo Días Vacación de ` + `${fecha_actual}: ${saldo_gestion_actual}`;

    page.drawText(saldoDiasText_2, {
      x: margin + 4 * cellWidth + 5,
      y: rowSaldoY + (cellHeight - 9) / 2,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    const rowTotalVacacionY = rowSaldoY - cellHeight;

    page.drawRectangle({
      x: margin + 4 * cellWidth,
      y: rowTotalVacacionY,
      width: 3 * cellWidth,
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    const totalVacacionText = `TOTAL DÍAS DISPONIBLES: ` + dias_disponibles;
    const totalVacacionTextWidth = verdanaBoldFont.widthOfTextAtSize(
      totalVacacionText,
      9,
    );
    page.drawText(totalVacacionText, {
      x: margin + (12 * cellWidth - totalVacacionTextWidth) / 2 - 15,
      y: rowTotalVacacionY + (cellHeight - 6) / 2,
      size: sizeNormal,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    const detalleReemplazoRowY = rowTotalVacacionY - 20;

    const detalleRowWidth = pageWidth - 2 * margin;

    page.drawRectangle({
      x: margin,
      y: detalleReemplazoRowY,
      width: detalleRowWidth,
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    const detalleReemplazoText = 'PERSONAL DE REEMPLAZO';
    const detalleReemplazoTextWidth = verdanaBoldFont.widthOfTextAtSize(
      detalleReemplazoText,
      9,
    );

    page.drawText(detalleReemplazoText, {
      x: margin + (detalleRowWidth - detalleReemplazoTextWidth) / 2,
      y: detalleReemplazoRowY + (cellHeight - 9) / 2 + 2,
      size: sizeNormal,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    const rowReemplazoY = detalleReemplazoRowY - cellHeight;

    const columnWidthsReemplazo = [45, 110, 46, 150, 25, 64, 45, 53.5];

    const drawCellWithTextReemplazo = (
      label: string,
      xPosR: number,
      yPosR: number,
      cellWidth: number,
    ) => {
      page.drawRectangle({
        x: xPosR,
        y: yPosR,
        width: cellWidth,
        height: cellHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });

      page.drawText(label, {
        x: xPosR + 5,
        y: yPosR + (cellHeight - sizeNormal) / 2,
        size: sizeNormal,
        font: verdanaFont,
        color: rgb(0, 0, 0),
      });
    };

    let xPosR = margin;

    drawCellWithTextReemplazo(
      'Nombres:',
      xPosR,
      rowReemplazoY,
      columnWidthsReemplazo[0],
    );
    xPosR += columnWidthsReemplazo[0];

    drawCellWithTextReemplazo(
      nombresReemplazo,
      xPosR,
      rowReemplazoY,
      columnWidthsReemplazo[1],
    );
    xPosR += columnWidthsReemplazo[1];

    drawCellWithTextReemplazo(
      'Apellidos:',
      xPosR,
      rowReemplazoY,
      columnWidthsReemplazo[2],
    );
    xPosR += columnWidthsReemplazo[2];

    drawCellWithTextReemplazo(
      apellidosReemplazo,
      xPosR,
      rowReemplazoY,
      columnWidthsReemplazo[3],
    );
    xPosR += columnWidthsReemplazo[3];

    drawCellWithTextReemplazo(
      'C.I.:',
      xPosR,
      rowReemplazoY,
      columnWidthsReemplazo[4],
    );
    xPosR += columnWidthsReemplazo[4];

    drawCellWithTextReemplazo(
      ciReemplazo,
      xPosR,
      rowReemplazoY,
      columnWidthsReemplazo[5],
    );
    xPosR += columnWidthsReemplazo[5];

    drawCellWithTextReemplazo(
      'Teléfono:',
      xPosR,
      rowReemplazoY,
      columnWidthsReemplazo[6],
    );
    xPosR += columnWidthsReemplazo[6];

    drawCellWithTextReemplazo(
      telefonoReemplazo,
      xPosR,
      rowReemplazoY,
      columnWidthsReemplazo[7],
    );

    const rowCargoDetalleY = rowReemplazoY - cellHeight;

    const columnWidthsCargoDetalle = [34, pageWidth - 2 * margin - 34];

    page.drawRectangle({
      x: margin,
      y: rowCargoDetalleY,
      width: columnWidthsCargoDetalle[0],
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    page.drawText('Cargo:', {
      x: margin + 5,
      y: rowCargoDetalleY + (cellHeight - sizeNormal) / 2,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    page.drawRectangle({
      x: margin + columnWidthsCargoDetalle[0],
      y: rowCargoDetalleY,
      width: columnWidthsCargoDetalle[1],
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    page.drawText(this.truncateText(cargoReemplazo, 139), {
      x: margin + columnWidthsCargoDetalle[0] + 5,
      y: rowCargoDetalleY + (cellHeight - sizeNormal) / 2,
      size: sizeMinimun,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    const rowFirmasY = rowCargoDetalleY - cellHeight;

    const firmaColumnWidth = detalleRowWidth / 2;

    page.drawRectangle({
      x: margin,
      y: rowFirmasY,
      width: firmaColumnWidth,
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    const solicitanteText = 'Solicitante';
    const solicitanteTextWidth = verdanaBoldFont.widthOfTextAtSize(
      solicitanteText,
      9,
    );
    page.drawText(solicitanteText, {
      x: margin + (firmaColumnWidth - solicitanteTextWidth) / 2,
      y: rowFirmasY + (cellHeight - 9) / 2 + 2,
      size: sizeNormal,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    page.drawRectangle({
      x: margin + firmaColumnWidth,
      y: rowFirmasY,
      width: firmaColumnWidth,
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    const jefeText = 'Jefe Inmediato Superior';
    const jefeTextWidth = verdanaBoldFont.widthOfTextAtSize(jefeText, 9);
    page.drawText(jefeText, {
      x: margin + firmaColumnWidth + (firmaColumnWidth - jefeTextWidth) / 2,
      y: rowFirmasY + (cellHeight - 9) / 2 + 2,
      size: sizeNormal,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    const rowFechaY = rowFirmasY - cellHeight;

    page.drawRectangle({
      x: margin,
      y: rowFechaY,
      width: firmaColumnWidth,
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    const fechaSolicitudLabel = 'Fecha de Solicitud: ';
    page.drawText(fechaSolicitudLabel, {
      x: margin + 5,
      y: rowFechaY + (cellHeight - 9) / 2,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    const fechaSolicitudLabelWidth = verdanaFont.widthOfTextAtSize(
      fechaSolicitudLabel,
      9,
    );
    page.drawRectangle({
      x: margin + 5 + fechaSolicitudLabelWidth + 2,
      y: rowFechaY + (cellHeight - squareSize) / 2,
      width: 0.2,
      height: squareSize,
      borderColor: rgb(0, 0, 0),
      borderWidth: 0.3,
    });
    page.drawText(fechaSolicitud, {
      x: margin + 5 + fechaSolicitudLabelWidth + 5,
      y: rowFechaY + (cellHeight - 9) / 2,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    page.drawRectangle({
      x: margin + firmaColumnWidth,
      y: rowFechaY,
      width: firmaColumnWidth,
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    const fechaAprobacionLabel = 'Fecha de Aprobación: ';
    const aprobacionX = margin + firmaColumnWidth + 5;
    page.drawText(fechaAprobacionLabel, {
      x: aprobacionX,
      y: rowFechaY + (cellHeight - 9) / 2,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    const fechaAprobacionLabelWidth = verdanaFont.widthOfTextAtSize(
      fechaAprobacionLabel,
      9,
    );
    page.drawRectangle({
      x: aprobacionX + fechaAprobacionLabelWidth + 2,
      y: rowFechaY + (cellHeight - squareSize) / 2,
      width: 0.5,
      height: squareSize,
      borderColor: rgb(0, 0, 0),
      borderWidth: 0.5,
    });
    page.drawText(fechaSolicitud, {
      x: aprobacionX + fechaAprobacionLabelWidth + 5,
      y: rowFechaY + (cellHeight - 9) / 2,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    const rowFirmasFinalY = rowFechaY - cellHeight;

    page.drawRectangle({
      x: margin,
      y: rowFirmasFinalY,
      width: firmaColumnWidth,
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    const firmaSolicitanteText = 'Firma del Solicitante';
    const firmaSolicitanteTextWidth = verdanaFont.widthOfTextAtSize(
      firmaSolicitanteText,
      9,
    );
    page.drawText(firmaSolicitanteText, {
      x: margin + (firmaColumnWidth - firmaSolicitanteTextWidth) / 2,
      y: rowFirmasFinalY + (cellHeight - 9) / 2,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    page.drawRectangle({
      x: margin + firmaColumnWidth,
      y: rowFirmasFinalY,
      width: firmaColumnWidth,
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    const firmaAprobacionText = 'Firma de Aprobación';
    const firmaAprobacionTextWidth = verdanaFont.widthOfTextAtSize(
      firmaAprobacionText,
      9,
    );
    page.drawText(firmaAprobacionText, {
      x:
        margin +
        firmaColumnWidth +
        (firmaColumnWidth - firmaAprobacionTextWidth) / 2,
      y: rowFirmasFinalY + (cellHeight - 9) / 2,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    const rowNuevaFilaY = rowFirmasFinalY - cellHeight - 70;

    page.drawRectangle({
      x: margin,
      y: rowNuevaFilaY,
      width: firmaColumnWidth,
      height: cellHeight + 70,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    page.drawRectangle({
      x: margin + firmaColumnWidth,
      y: rowNuevaFilaY,
      width: firmaColumnWidth,
      height: cellHeight + 70,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    saveAs(blob, 'solicitud_de_vacaciones.pdf');
  }

  async generateExcepcion(datosGenerales: any, element: any, contrato: any) {
    let nombres = datosGenerales.nombres || '';
    let apellidos = datosGenerales.apellidos || '';
    let ci = datosGenerales.ci || '';
    let telefono = datosGenerales.telefono || '';
    let cargo = datosGenerales.cargo || '';
    let registro = datosGenerales.registro || '';
    let unidad = datosGenerales.unidad || '';

    let dependencia = datosGenerales.dependencia || '';
    let fechaSolicitud = this.formatearFecha(element.fecha_envio) || '';
    let fechaSalida = this.formatearFecha(element.fecha_inicio) || '';
    let horaInicio = element.hora_inicio || '';
    let horaFin = element.hora_fin || '';
    let detalle = element.detalle || '';
    let titleText = 'SOLICITUD DE ' + element?.contenido?.titulo;
    let note =
      'NOTA: La presente solicitud deberá ser devuelta con sello del lugar o institución visitada en un plazo de 48 horas, pasado el tiempo solicitado se';
    let noteContinuos = ' considera abandono de labores.';

    let sizeTitle = 12;
    let sizeNormal = 7;
    let sizeMinimun = 6;
    let squareSize = 15;
    let pdfDoc = await PDFDocument.create();

    let cellHeight = 15;

    pdfDoc.registerFontkit(fontkit);

    let verdanaBytes = await fetch('/assets/fonts/verdana.ttf').then((res) =>
      res.arrayBuffer(),
    );
    let verdanaFont = await pdfDoc.embedFont(verdanaBytes);

    let verdanaBoldBytes = await fetch('/assets/fonts/verdana-bold.ttf').then(
      (res) => res.arrayBuffer(),
    );
    let verdanaBoldFont = await pdfDoc.embedFont(verdanaBoldBytes);

    let page = pdfDoc.addPage([595.28, 841.89]);

    let margin = 28.35;
    let pageWidth = page.getWidth();
    let pageHeight = page.getHeight();

    let rowHeight = 45;
    let columnWidth = (pageWidth - 2 * margin) / 3;

    page.drawRectangle({
      x: margin,
      y: pageHeight - margin - rowHeight,
      width: pageWidth - 2 * margin,
      height: rowHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
      color: rgb(1, 1, 1),
    });

    let logoBytes = await fetch('/assets/img/logo.png').then((res) =>
      res.arrayBuffer(),
    );
    let logoImage = await pdfDoc.embedPng(logoBytes);
    let logoDims = logoImage.scale(0.1);
    page.drawImage(logoImage, {
      x: margin + 5,
      y: pageHeight - margin - rowHeight + 5,
      width: logoDims.width,
      height: logoDims.height,
    });

    let titleHeight = verdanaBoldFont.heightAtSize(12);
    page.drawText(titleText, {
      x: margin + columnWidth - 40,
      y: pageHeight - margin - rowHeight + (rowHeight - titleHeight) / 2,
      size: sizeTitle,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    let codeText = 'Form SAC003';
    let codeWidth = verdanaFont.widthOfTextAtSize(codeText, 8);
    page.drawText(codeText, {
      x: margin + 2 * columnWidth + columnWidth - codeWidth - 26.5,
      y: pageHeight - margin - 15,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    let codeDate = 'FECHA: ' + fechaSolicitud;
    let codeDateWith = verdanaFont.widthOfTextAtSize(codeDate, 8);
    page.drawText(codeDate, {
      x: margin + 2 * columnWidth + columnWidth - codeDateWith,
      y: pageHeight - margin - 35,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    let datosGeneralesRowY = pageHeight - margin - rowHeight - 14.7;
    let datosGeneralesRowWidth = pageWidth - 2 * margin;

    page.drawRectangle({
      x: margin,
      y: datosGeneralesRowY,
      width: datosGeneralesRowWidth,
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    let datosGeneralesText = 'DATOS GENERALES';
    let datosGeneralesTextWidth = verdanaBoldFont.widthOfTextAtSize(
      datosGeneralesText,
      9,
    );

    page.drawText(datosGeneralesText, {
      x: margin + (datosGeneralesRowWidth - datosGeneralesTextWidth) / 2,
      y: datosGeneralesRowY + (cellHeight - 9) / 2 + 2,
      size: sizeNormal,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    let rowDatosGeneralesY = datosGeneralesRowY - cellHeight;

    let columnWidths = [45, 110, 46, 150, 25, 64, 45, 53.5];

    let drawCellWithText = (
      label: string,
      xPos: number,
      yPos: number,
      cellWidth: number,
    ) => {
      page.drawRectangle({
        x: xPos,
        y: yPos,
        width: cellWidth,
        height: cellHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });

      page.drawText(label, {
        x: xPos + 5,
        y: yPos + (cellHeight - sizeNormal) / 2,
        size: sizeNormal,
        font: verdanaFont,
        color: rgb(0, 0, 0),
      });
    };

    let xPos = margin;

    drawCellWithText('Nombres:', xPos, rowDatosGeneralesY, columnWidths[0]);
    xPos += columnWidths[0];

    drawCellWithText(nombres, xPos, rowDatosGeneralesY, columnWidths[1]);
    xPos += columnWidths[1];

    drawCellWithText('Apellidos:', xPos, rowDatosGeneralesY, columnWidths[2]);
    xPos += columnWidths[2];

    drawCellWithText(apellidos, xPos, rowDatosGeneralesY, columnWidths[3]);
    xPos += columnWidths[3];

    drawCellWithText('C.I.:', xPos, rowDatosGeneralesY, columnWidths[4]);
    xPos += columnWidths[4];

    drawCellWithText(ci, xPos, rowDatosGeneralesY, columnWidths[5]);
    xPos += columnWidths[5];

    drawCellWithText('Teléfono:', xPos, rowDatosGeneralesY, columnWidths[6]);
    xPos += columnWidths[6];

    drawCellWithText(telefono, xPos, rowDatosGeneralesY, columnWidths[7]);

    let rowCargoY = rowDatosGeneralesY - cellHeight;

    let columnWidthsCargo = [34, pageWidth - 2 * margin - 34];

    page.drawRectangle({
      x: margin,
      y: rowCargoY,
      width: columnWidthsCargo[0],
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    page.drawText('Cargo:', {
      x: margin + 5,
      y: rowCargoY + (cellHeight - sizeNormal) / 2,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    page.drawRectangle({
      x: margin + columnWidthsCargo[0],
      y: rowCargoY,
      width: columnWidthsCargo[1],
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    page.drawText(this.truncateText(cargo, 139), {
      x: margin + columnWidthsCargo[0] + 5,
      y: rowCargoY + (cellHeight - sizeNormal) / 2,
      size: sizeMinimun,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    let rowRegistroY = rowCargoY - cellHeight;

    let columnWidthsRegistro = [
      55,
      33,
      35,
      310,
      58,
      pageWidth - 2 * margin - 491,
    ];

    page.drawRectangle({
      x: margin,
      y: rowRegistroY,
      width: columnWidthsRegistro[0],
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });
    page.drawText(`N° ${contrato}: `, {
      x: margin + 5,
      y: rowRegistroY + (cellHeight - sizeNormal) / 2,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    page.drawRectangle({
      x: margin + columnWidthsRegistro[0],
      y: rowRegistroY,
      width: columnWidthsRegistro[1],
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });
    page.drawText(`${registro}`, {
      x: margin + columnWidthsRegistro[0] + 5,
      y: rowRegistroY + (cellHeight - sizeNormal) / 2,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    page.drawRectangle({
      x: margin + columnWidthsRegistro[0] + columnWidthsRegistro[1],
      y: rowRegistroY,
      width: columnWidthsRegistro[2],
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });
    page.drawText('Unidad:', {
      x: margin + columnWidthsRegistro[0] + columnWidthsRegistro[1] + 5,
      y: rowRegistroY + (cellHeight - sizeNormal) / 2,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    page.drawRectangle({
      x:
        margin +
        columnWidthsRegistro[0] +
        columnWidthsRegistro[1] +
        columnWidthsRegistro[2],
      y: rowRegistroY,
      width: columnWidthsRegistro[3],
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });
    page.drawText(this.truncateText(unidad, 100), {
      x:
        margin +
        columnWidthsRegistro[0] +
        columnWidthsRegistro[1] +
        columnWidthsRegistro[2] +
        5,
      y: rowRegistroY + (cellHeight - sizeNormal) / 2,
      size: sizeMinimun,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    page.drawRectangle({
      x:
        margin +
        columnWidthsRegistro[0] +
        columnWidthsRegistro[1] +
        columnWidthsRegistro[2] +
        columnWidthsRegistro[3],
      y: rowRegistroY,
      width: columnWidthsRegistro[4],
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });
    page.drawText('Dependencia:', {
      x:
        margin +
        columnWidthsRegistro[0] +
        columnWidthsRegistro[1] +
        columnWidthsRegistro[2] +
        columnWidthsRegistro[3] +
        5,
      y: rowRegistroY + (cellHeight - sizeNormal) / 2,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    page.drawRectangle({
      x:
        margin +
        columnWidthsRegistro[0] +
        columnWidthsRegistro[1] +
        columnWidthsRegistro[2] +
        columnWidthsRegistro[3] +
        columnWidthsRegistro[4],
      y: rowRegistroY,
      width: columnWidthsRegistro[5],
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });
    page.drawText(this.truncateText(dependencia, 25), {
      x:
        margin +
        columnWidthsRegistro[0] +
        columnWidthsRegistro[1] +
        columnWidthsRegistro[2] +
        columnWidthsRegistro[3] +
        columnWidthsRegistro[4] +
        5,
      y: rowRegistroY + (cellHeight - sizeNormal) / 2,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    let detalleRowY = rowDatosGeneralesY - 45;

    let detalleRowXWidth = pageWidth - 2 * margin;

    page.drawRectangle({
      x: margin,
      y: detalleRowY,
      width: detalleRowXWidth,
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    let detalleText = 'SALIDA';
    let detalleTextWidth = verdanaBoldFont.widthOfTextAtSize(detalleText, 9);

    page.drawText(detalleText, {
      x: margin + (detalleRowXWidth - detalleTextWidth) / 2,
      y: detalleRowY + (cellHeight - 9) / 2 + 2,
      size: sizeNormal,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    let row4Y = detalleRowY - 15;

    let cellWidth = (pageWidth - 2 * margin) / 7;

    let rowTotalDiasY = row4Y - 21;

    page.drawRectangle({
      x: margin,
      y: rowTotalDiasY - 76,
      width: 3 * cellWidth,
      height: cellHeight * 7 + 3,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    let totalDiasText = `SELLO DEL LUGAR VISITADO`;
    let totalDiasTextWidth = verdanaFont.widthOfTextAtSize(totalDiasText, 7);
    page.drawText(totalDiasText, {
      x: margin + cellWidth - 4,
      y: rowTotalDiasY - 20,
      size: sizeMinimun,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    page.drawRectangle({
      x: margin + 3 * cellWidth + 3,
      y: rowTotalDiasY + 17.5,
      width: 1 * cellWidth - 9,
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    let fechaTitulo = `Fecha de Salida:`;

    page.drawText(fechaTitulo, {
      x: margin + 3 * cellWidth + 8,
      y: rowTotalDiasY + 21.5,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    page.drawText(fechaSalida, {
      x: margin + 3 * cellWidth + 75,
      y: rowTotalDiasY + 21.5,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    page.drawRectangle({
      x: margin + 3 * cellWidth + 125,
      y: rowTotalDiasY + 17.5,
      width: 65,
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    let horaTitulo = `Hora Excepción:`;

    page.drawText(horaTitulo, {
      x: margin + 3 * cellWidth + 129,
      y: rowTotalDiasY + 21.5,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    page.drawRectangle({
      x: margin + 3 * cellWidth + 3,
      y: rowTotalDiasY + 17.5,
      width: 4 * cellWidth - 3,
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    let saldoDiasText = `De hrs.: ${horaInicio}   A hrs.: ${horaFin}`;

    page.drawText(saldoDiasText, {
      x: margin + 5 * cellWidth + 40,
      y: rowTotalDiasY + 21.5,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    let rowSaldoY = rowTotalDiasY - cellHeight;

    page.drawRectangle({
      x: margin + 3 * cellWidth + 3,
      y: rowSaldoY + 17.5 - 3,
      width: 4 * cellWidth - 3,
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    let saldoDiasText_2 = `Motivo`;

    page.drawText(saldoDiasText_2, {
      x: margin + 4 * cellWidth + 61,
      y: rowSaldoY + 19,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    let rowTotalVacacionY = rowSaldoY - cellHeight;

    let rectX = margin + 3 * cellWidth + 3;
    let rectY = rowTotalVacacionY - 46.5;
    let rectWidth = 4 * cellWidth - 3;
    let rectHeight = cellHeight * 4 + 16;
    let lineHeight = 10;
    let padding = 5;

    page.drawRectangle({
      x: rectX,
      y: rectY,
      width: rectWidth,
      height: rectHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    let textLines: string[] = [];
    let remainingText = detalle;

    while (remainingText.length > 0) {
      let i = remainingText.length;
      while (
        verdanaFont.widthOfTextAtSize(remainingText.slice(0, i), sizeNormal) >
        rectWidth - 2 * padding
      ) {
        i--;
      }
      textLines.push(remainingText.slice(0, i));
      remainingText = remainingText.slice(i);
    }

    let currentY = rectY + rectHeight - lineHeight - padding;
    textLines.forEach((line) => {
      if (currentY > rectY + padding) {
        page.drawText(line, {
          x: rectX + padding,
          y: currentY,
          size: sizeNormal,
          font: verdanaFont,
          color: rgb(0, 0, 0),
        });
        currentY -= lineHeight;
      }
    });

    let detalleReemplazoRowY = rowTotalVacacionY - 20;

    let detalleRowWidth = pageWidth - 2 * margin;

    let rowReemplazoY = detalleReemplazoRowY - cellHeight;

    let rowCargoDetalleY = rowReemplazoY - cellHeight;

    let columnWidthsCargoDetalle = [34, pageWidth - 2 * margin - 34];

    let rowFirmasY = rowCargoDetalleY - cellHeight;

    let firmaColumnWidth = detalleRowWidth / 3;

    page.drawRectangle({
      x: margin,
      y: rowFirmasY,
      width: firmaColumnWidth,
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    let solicitanteText = 'Solicitante';
    let solicitanteTextWidth = verdanaBoldFont.widthOfTextAtSize(
      solicitanteText,
      9,
    );
    page.drawText(solicitanteText, {
      x: margin + (firmaColumnWidth - solicitanteTextWidth) / 2 + 5,
      y: rowFirmasY + (cellHeight - 9) / 2 + 2,
      size: sizeNormal,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    page.drawRectangle({
      x: margin + firmaColumnWidth,
      y: rowFirmasY,
      width: firmaColumnWidth,
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    let jefeText = 'Inmediato Superior';
    let jefeTextWidth = verdanaBoldFont.widthOfTextAtSize(jefeText, 9);
    page.drawText(jefeText, {
      x:
        margin + firmaColumnWidth + (firmaColumnWidth - jefeTextWidth) / 2 + 10,
      y: rowFirmasY + (cellHeight - 9) / 2 + 2,
      size: sizeNormal,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    page.drawRectangle({
      x: margin + 2 * firmaColumnWidth,
      y: rowFirmasY,
      width: firmaColumnWidth,
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    let direccionText = 'Dirección Adm. y RRHH';
    let direccionTextWidth = verdanaBoldFont.widthOfTextAtSize(
      direccionText,
      9,
    );
    page.drawText(direccionText, {
      x:
        margin +
        2 * firmaColumnWidth +
        (firmaColumnWidth - direccionTextWidth) / 2 +
        10,
      y: rowFirmasY + (cellHeight - 9) / 2 + 2,
      size: sizeNormal,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    let rowNuevaFilaY = rowFirmasY - cellHeight - 70;

    page.drawRectangle({
      x: margin,
      y: rowNuevaFilaY,
      width: firmaColumnWidth,
      height: cellHeight + 70,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    page.drawRectangle({
      x: margin + firmaColumnWidth,
      y: rowNuevaFilaY,
      width: firmaColumnWidth,
      height: cellHeight + 70,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    page.drawRectangle({
      x: margin + 2 * firmaColumnWidth,
      y: rowNuevaFilaY,
      width: firmaColumnWidth,
      height: cellHeight + 70,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    page.drawRectangle({
      x: 0,
      y: pageHeight / 2,
      width: pageWidth,
      height: 1,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    page.drawText(note, {
      x: margin + 10,
      y: rowNuevaFilaY - 15,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    page.drawText(noteContinuos, {
      x: margin + 37,
      y: rowNuevaFilaY - 25,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    let midPageY = pageHeight / 2;

    let secondPageRowY = pageHeight - margin - rowHeight - midPageY;

    page.drawRectangle({
      x: margin,
      y: secondPageRowY,
      width: pageWidth - 2 * margin,
      height: rowHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
      color: rgb(1, 1, 1),
    });

    page.drawImage(logoImage, {
      x: margin + 5,
      y: secondPageRowY + 5,
      width: logoDims.width,
      height: logoDims.height,
    });

    page.drawText(titleText, {
      x: margin + columnWidth - 40,
      y: secondPageRowY + (rowHeight - titleHeight) / 2,
      size: sizeTitle,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    let nameForm = pageHeight - margin - midPageY;
    page.drawText(codeText, {
      x: margin + 2 * columnWidth + columnWidth - codeWidth - 26.5,
      y: nameForm - 15,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    page.drawText(codeDate, {
      x: margin + 2 * columnWidth + columnWidth - codeDateWith,
      y: nameForm - 35,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    datosGeneralesRowY = pageHeight - margin - rowHeight - 14.7 - midPageY;

    page.drawRectangle({
      x: margin,
      y: datosGeneralesRowY,
      width: datosGeneralesRowWidth,
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    page.drawText(datosGeneralesText, {
      x: margin + (datosGeneralesRowWidth - datosGeneralesTextWidth) / 2,
      y: datosGeneralesRowY + (cellHeight - 9) / 2 + 2,
      size: sizeNormal,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    rowDatosGeneralesY = datosGeneralesRowY - cellHeight;

    drawCellWithText = (
      label: string,
      xPos: number,
      yPos: number,
      cellWidth: number,
    ) => {
      page.drawRectangle({
        x: xPos,
        y: yPos,
        width: cellWidth,
        height: cellHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });

      page.drawText(label, {
        x: xPos + 5,
        y: yPos + (cellHeight - sizeNormal) / 2,
        size: sizeNormal,
        font: verdanaFont,
        color: rgb(0, 0, 0),
      });
    };

    xPos = margin;

    drawCellWithText('Nombres:', xPos, rowDatosGeneralesY, columnWidths[0]);
    xPos += columnWidths[0];

    drawCellWithText(nombres, xPos, rowDatosGeneralesY, columnWidths[1]);
    xPos += columnWidths[1];

    drawCellWithText('Apellidos:', xPos, rowDatosGeneralesY, columnWidths[2]);
    xPos += columnWidths[2];

    drawCellWithText(apellidos, xPos, rowDatosGeneralesY, columnWidths[3]);
    xPos += columnWidths[3];

    drawCellWithText('C.I.:', xPos, rowDatosGeneralesY, columnWidths[4]);
    xPos += columnWidths[4];

    drawCellWithText(ci, xPos, rowDatosGeneralesY, columnWidths[5]);
    xPos += columnWidths[5];

    drawCellWithText('Teléfono:', xPos, rowDatosGeneralesY, columnWidths[6]);
    xPos += columnWidths[6];

    drawCellWithText(telefono, xPos, rowDatosGeneralesY, columnWidths[7]);

    rowCargoY = rowDatosGeneralesY - cellHeight;

    page.drawRectangle({
      x: margin,
      y: rowCargoY,
      width: columnWidthsCargo[0],
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    page.drawText('Cargo:', {
      x: margin + 5,
      y: rowCargoY + (cellHeight - sizeNormal) / 2,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    page.drawRectangle({
      x: margin + columnWidthsCargo[0],
      y: rowCargoY,
      width: columnWidthsCargo[1],
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    page.drawText(this.truncateText(cargo, 139), {
      x: margin + columnWidthsCargo[0] + 5,
      y: rowCargoY + (cellHeight - sizeNormal) / 2,
      size: sizeMinimun,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    rowRegistroY = rowCargoY - cellHeight;

    page.drawRectangle({
      x: margin,
      y: rowRegistroY,
      width: columnWidthsRegistro[0],
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });
    page.drawText(`N° ${contrato}: `, {
      x: margin + 5,
      y: rowRegistroY + (cellHeight - sizeNormal) / 2,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    page.drawRectangle({
      x: margin + columnWidthsRegistro[0],
      y: rowRegistroY,
      width: columnWidthsRegistro[1],
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });
    page.drawText(`${registro}`, {
      x: margin + columnWidthsRegistro[0] + 5,
      y: rowRegistroY + (cellHeight - sizeNormal) / 2,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    page.drawRectangle({
      x: margin + columnWidthsRegistro[0] + columnWidthsRegistro[1],
      y: rowRegistroY,
      width: columnWidthsRegistro[2],
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });
    page.drawText('Unidad:', {
      x: margin + columnWidthsRegistro[0] + columnWidthsRegistro[1] + 5,
      y: rowRegistroY + (cellHeight - sizeNormal) / 2,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    page.drawRectangle({
      x:
        margin +
        columnWidthsRegistro[0] +
        columnWidthsRegistro[1] +
        columnWidthsRegistro[2],
      y: rowRegistroY,
      width: columnWidthsRegistro[3],
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });
    page.drawText(this.truncateText(unidad, 100), {
      x:
        margin +
        columnWidthsRegistro[0] +
        columnWidthsRegistro[1] +
        columnWidthsRegistro[2] +
        5,
      y: rowRegistroY + (cellHeight - sizeNormal) / 2,
      size: sizeMinimun,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    page.drawRectangle({
      x:
        margin +
        columnWidthsRegistro[0] +
        columnWidthsRegistro[1] +
        columnWidthsRegistro[2] +
        columnWidthsRegistro[3],
      y: rowRegistroY,
      width: columnWidthsRegistro[4],
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });
    page.drawText('Dependencia:', {
      x:
        margin +
        columnWidthsRegistro[0] +
        columnWidthsRegistro[1] +
        columnWidthsRegistro[2] +
        columnWidthsRegistro[3] +
        5,
      y: rowRegistroY + (cellHeight - sizeNormal) / 2,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    page.drawRectangle({
      x:
        margin +
        columnWidthsRegistro[0] +
        columnWidthsRegistro[1] +
        columnWidthsRegistro[2] +
        columnWidthsRegistro[3] +
        columnWidthsRegistro[4],
      y: rowRegistroY,
      width: columnWidthsRegistro[5],
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });
    page.drawText(this.truncateText(dependencia, 25), {
      x:
        margin +
        columnWidthsRegistro[0] +
        columnWidthsRegistro[1] +
        columnWidthsRegistro[2] +
        columnWidthsRegistro[3] +
        columnWidthsRegistro[4] +
        5,
      y: rowRegistroY + (cellHeight - sizeNormal) / 2,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    detalleRowY = rowDatosGeneralesY - 45;

    page.drawRectangle({
      x: margin,
      y: detalleRowY,
      width: detalleRowXWidth,
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    page.drawText(detalleText, {
      x: margin + (detalleRowXWidth - detalleTextWidth) / 2,
      y: detalleRowY + (cellHeight - 9) / 2 + 2,
      size: sizeNormal,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    row4Y = detalleRowY - 15;

    rowTotalDiasY = row4Y - 21;

    page.drawRectangle({
      x: margin,
      y: rowTotalDiasY - 76,
      width: 3 * cellWidth,
      height: cellHeight * 7 + 3,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    page.drawText(totalDiasText, {
      x: margin + cellWidth - 4,
      y: rowTotalDiasY - 20,
      size: sizeMinimun,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    page.drawRectangle({
      x: margin + 3 * cellWidth + 3,
      y: rowTotalDiasY + 17.5,
      width: 1 * cellWidth - 9,
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    page.drawText(fechaTitulo, {
      x: margin + 3 * cellWidth + 8,
      y: rowTotalDiasY + 21.5,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    page.drawText(fechaSalida, {
      x: margin + 3 * cellWidth + 75,
      y: rowTotalDiasY + 21.5,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    page.drawRectangle({
      x: margin + 3 * cellWidth + 125,
      y: rowTotalDiasY + 17.5,
      width: 65,
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    page.drawText(horaTitulo, {
      x: margin + 3 * cellWidth + 129,
      y: rowTotalDiasY + 21.5,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    page.drawRectangle({
      x: margin + 3 * cellWidth + 3,
      y: rowTotalDiasY + 17.5,
      width: 4 * cellWidth - 3,
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    page.drawText(saldoDiasText, {
      x: margin + 5 * cellWidth + 40,
      y: rowTotalDiasY + 21.5,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    rowSaldoY = rowTotalDiasY - cellHeight;

    page.drawRectangle({
      x: margin + 3 * cellWidth + 3,
      y: rowSaldoY + 17.5 - 3,
      width: 4 * cellWidth - 3,
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    page.drawText(saldoDiasText_2, {
      x: margin + 4 * cellWidth + 61,
      y: rowSaldoY + 19,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    rowTotalVacacionY = rowSaldoY - cellHeight;

    rectX = margin + 3 * cellWidth + 3;
    rectY = rowTotalVacacionY - 46.5;
    rectWidth = 4 * cellWidth - 3;
    rectHeight = cellHeight * 4 + 16;
    lineHeight = 10;
    padding = 5;

    page.drawRectangle({
      x: rectX,
      y: rectY,
      width: rectWidth,
      height: rectHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    textLines = [];
    remainingText = detalle;

    while (remainingText.length > 0) {
      let i = remainingText.length;
      while (
        verdanaFont.widthOfTextAtSize(remainingText.slice(0, i), sizeNormal) >
        rectWidth - 2 * padding
      ) {
        i--;
      }
      textLines.push(remainingText.slice(0, i));
      remainingText = remainingText.slice(i);
    }

    currentY = rectY + rectHeight - lineHeight - padding;
    textLines.forEach((line) => {
      if (currentY > rectY + padding) {
        page.drawText(line, {
          x: rectX + padding,
          y: currentY,
          size: sizeNormal,
          font: verdanaFont,
          color: rgb(0, 0, 0),
        });
        currentY -= lineHeight;
      }
    });

    detalleReemplazoRowY = rowTotalVacacionY - 20;

    detalleRowWidth = pageWidth - 2 * margin;

    rowReemplazoY = detalleReemplazoRowY - cellHeight;

    rowCargoDetalleY = rowReemplazoY - cellHeight;

    columnWidthsCargoDetalle = [34, pageWidth - 2 * margin - 34];

    rowFirmasY = rowCargoDetalleY - cellHeight;

    firmaColumnWidth = detalleRowWidth / 3;

    page.drawRectangle({
      x: margin,
      y: rowFirmasY,
      width: firmaColumnWidth,
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    page.drawText(solicitanteText, {
      x: margin + (firmaColumnWidth - solicitanteTextWidth) / 2 + 5,
      y: rowFirmasY + (cellHeight - 9) / 2 + 2,
      size: sizeNormal,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    page.drawRectangle({
      x: margin + firmaColumnWidth,
      y: rowFirmasY,
      width: firmaColumnWidth,
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    page.drawText(jefeText, {
      x:
        margin + firmaColumnWidth + (firmaColumnWidth - jefeTextWidth) / 2 + 10,
      y: rowFirmasY + (cellHeight - 9) / 2 + 2,
      size: sizeNormal,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    page.drawRectangle({
      x: margin + 2 * firmaColumnWidth,
      y: rowFirmasY,
      width: firmaColumnWidth,
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    page.drawText(direccionText, {
      x:
        margin +
        2 * firmaColumnWidth +
        (firmaColumnWidth - direccionTextWidth) / 2 +
        10,
      y: rowFirmasY + (cellHeight - 9) / 2 + 2,
      size: sizeNormal,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    rowNuevaFilaY = rowFirmasY - cellHeight - 70;

    page.drawRectangle({
      x: margin,
      y: rowNuevaFilaY,
      width: firmaColumnWidth,
      height: cellHeight + 70,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    page.drawRectangle({
      x: margin + firmaColumnWidth,
      y: rowNuevaFilaY,
      width: firmaColumnWidth,
      height: cellHeight + 70,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    page.drawRectangle({
      x: margin + 2 * firmaColumnWidth,
      y: rowNuevaFilaY,
      width: firmaColumnWidth,
      height: cellHeight + 70,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    page.drawText(note, {
      x: margin + 10,
      y: rowNuevaFilaY - 15,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    page.drawText(noteContinuos, {
      x: margin + 37,
      y: rowNuevaFilaY - 25,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    saveAs(blob, 'solicitud_de_excepcion.pdf');
  }

  async generatePermiso(datosGenerales: any, element: any, contrato: any) {
    let nombres = datosGenerales.nombres || '';
    let apellidos = datosGenerales.apellidos || '';
    let ci = datosGenerales.ci || '';
    let telefono = datosGenerales.telefono || '';
    let cargo = datosGenerales.cargo || '';
    let registro = datosGenerales.registro || '';
    let unidad = datosGenerales.unidad || '';

    let dependencia = datosGenerales.dependencia || '';
    let fechaSolicitud = this.formatearFecha(element.fecha_envio) || '';
    let fechaSalida = this.formatearFecha(element.fecha_inicio) || '';
    let horaInicio = element.hora_inicio || '';
    let horaFin = element.hora_fin || '';
    let detalle = element.detalle || '';
    let titleText = 'SOLICITUD DE ' + element?.contenido?.titulo;

    const dias_solicitados = element.dias_totales || '';

    const dias = element.dias.map((dia: any) => {
      const fechaISO = dia.fecha.split('T')[0];
      const [anio, mes, diaNum] = fechaISO.split('-');

      const formato = `${diaNum}/${mes}/${anio}`;

      return {
        ...dia,
        fechaFormateada: formato,
      };
    });

    let sizeTitle = 12;
    let sizeNormal = 7;
    let sizeMinimun = 6;
    let squareSize = 15;
    let pdfDoc = await PDFDocument.create();

    let cellHeight = 15;

    pdfDoc.registerFontkit(fontkit);

    let verdanaBytes = await fetch('/assets/fonts/verdana.ttf').then((res) =>
      res.arrayBuffer(),
    );
    let verdanaFont = await pdfDoc.embedFont(verdanaBytes);

    let verdanaBoldBytes = await fetch('/assets/fonts/verdana-bold.ttf').then(
      (res) => res.arrayBuffer(),
    );
    let verdanaBoldFont = await pdfDoc.embedFont(verdanaBoldBytes);

    let page = pdfDoc.addPage([595.28, 841.89]);

    let margin = 28.35;
    let pageWidth = page.getWidth();
    let pageHeight = page.getHeight();

    let rowHeight = 45;
    let columnWidth = (pageWidth - 2 * margin) / 3;

    page.drawRectangle({
      x: margin,
      y: pageHeight - margin - rowHeight,
      width: pageWidth - 2 * margin,
      height: rowHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
      color: rgb(1, 1, 1),
    });

    let logoBytes = await fetch('/assets/img/logo.png').then((res) =>
      res.arrayBuffer(),
    );
    let logoImage = await pdfDoc.embedPng(logoBytes);
    let logoDims = logoImage.scale(0.1);
    page.drawImage(logoImage, {
      x: margin + 5,
      y: pageHeight - margin - rowHeight + 5,
      width: logoDims.width,
      height: logoDims.height,
    });

    let titleWidth = verdanaBoldFont.widthOfTextAtSize(titleText, sizeTitle);
    let titleHeight = verdanaBoldFont.heightAtSize(sizeTitle);

    let centerX = margin + (pageWidth - 2 * margin - titleWidth) / 2;

    page.drawText(titleText, {
      x: centerX,
      y: pageHeight - margin - rowHeight + (rowHeight - titleHeight) / 2,
      size: sizeTitle,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    let codeText = 'FOR-RH-001';
    let codeWidth = verdanaFont.widthOfTextAtSize(codeText, 8);
    page.drawText(codeText, {
      x: margin + 2 * columnWidth + columnWidth - codeWidth - 30,
      y: pageHeight - margin - 15,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    let codeDate = 'FECHA: ' + fechaSolicitud;
    let codeDateWith = verdanaFont.widthOfTextAtSize(codeDate, 8);
    page.drawText(codeDate, {
      x: margin + 2 * columnWidth + columnWidth - codeDateWith,
      y: pageHeight - margin - 35,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    let datosGeneralesRowY = pageHeight - margin - rowHeight - 14.7;
    let datosGeneralesRowWidth = pageWidth - 2 * margin;

    page.drawRectangle({
      x: margin,
      y: datosGeneralesRowY,
      width: datosGeneralesRowWidth,
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    let datosGeneralesText = 'DATOS GENERALES';
    let datosGeneralesTextWidth = verdanaBoldFont.widthOfTextAtSize(
      datosGeneralesText,
      9,
    );

    page.drawText(datosGeneralesText, {
      x: margin + (datosGeneralesRowWidth - datosGeneralesTextWidth) / 2,
      y: datosGeneralesRowY + (cellHeight - 9) / 2 + 2,
      size: sizeNormal,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    let rowDatosGeneralesY = datosGeneralesRowY - cellHeight;

    let columnWidths = [45, 110, 46, 150, 25, 64, 45, 53.5];

    let drawCellWithText = (
      label: string,
      xPos: number,
      yPos: number,
      cellWidth: number,
    ) => {
      page.drawRectangle({
        x: xPos,
        y: yPos,
        width: cellWidth,
        height: cellHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });

      page.drawText(label, {
        x: xPos + 5,
        y: yPos + (cellHeight - sizeNormal) / 2,
        size: sizeNormal,
        font: verdanaFont,
        color: rgb(0, 0, 0),
      });
    };

    let xPos = margin;

    drawCellWithText('Nombres:', xPos, rowDatosGeneralesY, columnWidths[0]);
    xPos += columnWidths[0];

    drawCellWithText(nombres, xPos, rowDatosGeneralesY, columnWidths[1]);
    xPos += columnWidths[1];

    drawCellWithText('Apellidos:', xPos, rowDatosGeneralesY, columnWidths[2]);
    xPos += columnWidths[2];

    drawCellWithText(apellidos, xPos, rowDatosGeneralesY, columnWidths[3]);
    xPos += columnWidths[3];

    drawCellWithText('C.I.:', xPos, rowDatosGeneralesY, columnWidths[4]);
    xPos += columnWidths[4];

    drawCellWithText(ci, xPos, rowDatosGeneralesY, columnWidths[5]);
    xPos += columnWidths[5];

    drawCellWithText('Teléfono:', xPos, rowDatosGeneralesY, columnWidths[6]);
    xPos += columnWidths[6];

    drawCellWithText(telefono, xPos, rowDatosGeneralesY, columnWidths[7]);

    let rowCargoY = rowDatosGeneralesY - cellHeight;

    let columnWidthsCargo = [34, pageWidth - 2 * margin - 34];

    page.drawRectangle({
      x: margin,
      y: rowCargoY,
      width: columnWidthsCargo[0],
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    page.drawText('Cargo:', {
      x: margin + 5,
      y: rowCargoY + (cellHeight - sizeNormal) / 2,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    page.drawRectangle({
      x: margin + columnWidthsCargo[0],
      y: rowCargoY,
      width: columnWidthsCargo[1],
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    page.drawText(this.truncateText(cargo, 139), {
      x: margin + columnWidthsCargo[0] + 5,
      y: rowCargoY + (cellHeight - sizeNormal) / 2,
      size: sizeMinimun,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    let rowRegistroY = rowCargoY - cellHeight;

    let columnWidthsRegistro = [
      55,
      33,
      35,
      310,
      58,
      pageWidth - 2 * margin - 491,
    ];

    page.drawRectangle({
      x: margin,
      y: rowRegistroY,
      width: columnWidthsRegistro[0],
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });
    page.drawText(`N° ${contrato}: `, {
      x: margin + 5,
      y: rowRegistroY + (cellHeight - sizeNormal) / 2,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    page.drawRectangle({
      x: margin + columnWidthsRegistro[0],
      y: rowRegistroY,
      width: columnWidthsRegistro[1],
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });
    page.drawText(`${registro}`, {
      x: margin + columnWidthsRegistro[0] + 5,
      y: rowRegistroY + (cellHeight - sizeNormal) / 2,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    page.drawRectangle({
      x: margin + columnWidthsRegistro[0] + columnWidthsRegistro[1],
      y: rowRegistroY,
      width: columnWidthsRegistro[2],
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });
    page.drawText('Unidad:', {
      x: margin + columnWidthsRegistro[0] + columnWidthsRegistro[1] + 5,
      y: rowRegistroY + (cellHeight - sizeNormal) / 2,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    page.drawRectangle({
      x:
        margin +
        columnWidthsRegistro[0] +
        columnWidthsRegistro[1] +
        columnWidthsRegistro[2],
      y: rowRegistroY,
      width: columnWidthsRegistro[3],
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });
    page.drawText(this.truncateText(unidad, 100), {
      x:
        margin +
        columnWidthsRegistro[0] +
        columnWidthsRegistro[1] +
        columnWidthsRegistro[2] +
        5,
      y: rowRegistroY + (cellHeight - sizeNormal) / 2,
      size: sizeMinimun,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    page.drawRectangle({
      x:
        margin +
        columnWidthsRegistro[0] +
        columnWidthsRegistro[1] +
        columnWidthsRegistro[2] +
        columnWidthsRegistro[3],
      y: rowRegistroY,
      width: columnWidthsRegistro[4],
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });
    page.drawText('Dependencia:', {
      x:
        margin +
        columnWidthsRegistro[0] +
        columnWidthsRegistro[1] +
        columnWidthsRegistro[2] +
        columnWidthsRegistro[3] +
        5,
      y: rowRegistroY + (cellHeight - sizeNormal) / 2,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    page.drawRectangle({
      x:
        margin +
        columnWidthsRegistro[0] +
        columnWidthsRegistro[1] +
        columnWidthsRegistro[2] +
        columnWidthsRegistro[3] +
        columnWidthsRegistro[4],
      y: rowRegistroY,
      width: columnWidthsRegistro[5],
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });
    page.drawText(this.truncateText(dependencia, 25), {
      x:
        margin +
        columnWidthsRegistro[0] +
        columnWidthsRegistro[1] +
        columnWidthsRegistro[2] +
        columnWidthsRegistro[3] +
        columnWidthsRegistro[4] +
        5,
      y: rowRegistroY + (cellHeight - sizeNormal) / 2,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    let detalleRowY = rowDatosGeneralesY - 45;

    let detalleRowXWidth = pageWidth - 2 * margin;

    page.drawRectangle({
      x: margin,
      y: detalleRowY,
      width: detalleRowXWidth,
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    let detalleText = 'DETALLE';
    let detalleTextWidth = verdanaBoldFont.widthOfTextAtSize(detalleText, 9);

    page.drawText(detalleText, {
      x: margin + (detalleRowXWidth - detalleTextWidth) / 2,
      y: detalleRowY + (cellHeight - 9) / 2 + 2,
      size: sizeNormal,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    let row4Y = detalleRowY - 15;

    let cellWidth = (pageWidth - 2 * margin) / 7;

    let headers = [
      'Fecha',
      'Jornada',
      'Turno',
      '',
      'Fecha',
      'Jornada',
      'Turno',
    ];
    headers.forEach((header, index) => {
      if (index === 3) {
        return;
      }
      let xPos = margin + index * cellWidth;
      page.drawText(header, {
        x: xPos + 2,
        y: row4Y + cellHeight - 10,
        size: sizeMinimun,
        font: verdanaBoldFont,
        color: rgb(0, 0, 0),
      });

      page.drawRectangle({
        x: xPos,
        y: row4Y,
        width: cellWidth,
        height: cellHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });
    });

    for (let rowIndex = 0; rowIndex < 20; rowIndex++) {
      let rowY = row4Y - (rowIndex + 1) * cellHeight;

      for (let colIndex = 0; colIndex < 7; colIndex++) {
        let xPos = margin + colIndex * cellWidth;

        if (colIndex === 3) {
          continue;
        }

        let dataIndex = rowIndex + (colIndex < 4 ? 0 : 20);

        let dia = dias[dataIndex];
        let text = '';
        if (dia) {
          text =
            colIndex % 3 === 0
              ? dia.fechaFormateada
              : colIndex % 3 === 1
                ? dia.jornada
                : dia.turno;
        }

        page.drawText(text || '', {
          x: xPos + 2,
          y: rowY + cellHeight - 10,
          size: sizeMinimun,
          font: verdanaFont,
          color: rgb(0, 0, 0),
        });

        page.drawRectangle({
          x: xPos,
          y: rowY,
          width: cellWidth,
          height: cellHeight,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        });
      }
    }

    let rowTotalDiasY = row4Y - 21 * cellHeight - 5;

    page.drawRectangle({
      x: margin,
      y: rowTotalDiasY,
      width: 3 * cellWidth,
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    let totalDiasText = `TOTAL DÍAS SOLICITADOS: `;
    let totalDiasTextWidth = verdanaBoldFont.widthOfTextAtSize(
      totalDiasText,
      7,
    );
    page.drawText(totalDiasText, {
      x: margin + (3 * cellWidth - totalDiasTextWidth) / 2 - 10,
      y: rowTotalDiasY + (cellHeight - 6) / 2,
      size: sizeNormal,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    let totalDiasValue = `${dias_solicitados}`;
    page.drawText(totalDiasValue, {
      x: margin + 3 * cellWidth - totalDiasTextWidth + 40,
      y: rowTotalDiasY + (cellHeight - 6) / 2,
      size: sizeNormal,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    let rowSaldoY = rowTotalDiasY - cellHeight - 19;
    let xMotivo = margin;
    let withMotivo = 7 * cellWidth - 3;
    page.drawRectangle({
      x: xMotivo,
      y: rowSaldoY + 17.5 - 3,
      width: withMotivo,
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    let saldoDiasText_2 = `Motivo`;

    page.drawText(saldoDiasText_2, {
      x: margin + 3 * cellWidth + 30,
      y: rowSaldoY + 19,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    let rowTotalVacacionY = rowSaldoY - cellHeight;

    let rectX = xMotivo;
    let rectY = rowTotalVacacionY - 46.5;
    let rectWidth = withMotivo;
    let rectHeight = cellHeight * 4 + 16;
    let lineHeight = 10;
    let padding = 5;

    page.drawRectangle({
      x: rectX,
      y: rectY,
      width: rectWidth,
      height: rectHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    let textLines: string[] = [];
    let remainingText = detalle;

    while (remainingText.length > 0) {
      let i = remainingText.length;
      while (
        verdanaFont.widthOfTextAtSize(remainingText.slice(0, i), sizeNormal) >
        rectWidth - 2 * padding
      ) {
        i--;
      }
      textLines.push(remainingText.slice(0, i));
      remainingText = remainingText.slice(i);
    }

    let currentY = rectY + rectHeight - lineHeight - padding;
    textLines.forEach((line) => {
      if (currentY > rectY + padding) {
        page.drawText(line, {
          x: rectX + padding,
          y: currentY,
          size: sizeNormal,
          font: verdanaFont,
          color: rgb(0, 0, 0),
        });
        currentY -= lineHeight;
      }
    });

    let detalleReemplazoRowY = rowTotalVacacionY - 22;

    let detalleRowWidth = pageWidth - 2 * margin;

    let rowReemplazoY = detalleReemplazoRowY - cellHeight;

    let rowCargoDetalleY = rowReemplazoY - cellHeight;

    let columnWidthsCargoDetalle = [34, pageWidth - 2 * margin - 34];

    let rowFirmasY = rowCargoDetalleY - cellHeight;

    let firmaColumnWidth = detalleRowWidth / 3;

    page.drawRectangle({
      x: margin,
      y: rowFirmasY,
      width: firmaColumnWidth,
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    let solicitanteText = 'Solicitante';
    let solicitanteTextWidth = verdanaBoldFont.widthOfTextAtSize(
      solicitanteText,
      9,
    );
    page.drawText(solicitanteText, {
      x: margin + (firmaColumnWidth - solicitanteTextWidth) / 2 + 5,
      y: rowFirmasY + (cellHeight - 9) / 2 + 2,
      size: sizeNormal,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    page.drawRectangle({
      x: margin + firmaColumnWidth,
      y: rowFirmasY,
      width: firmaColumnWidth,
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    let jefeText = 'Inmediato Superior';
    let jefeTextWidth = verdanaBoldFont.widthOfTextAtSize(jefeText, 9);
    page.drawText(jefeText, {
      x:
        margin + firmaColumnWidth + (firmaColumnWidth - jefeTextWidth) / 2 + 10,
      y: rowFirmasY + (cellHeight - 9) / 2 + 2,
      size: sizeNormal,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    page.drawRectangle({
      x: margin + 2 * firmaColumnWidth,
      y: rowFirmasY,
      width: firmaColumnWidth,
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    let direccionText = 'Dirección Adm. y RRHH';
    let direccionTextWidth = verdanaBoldFont.widthOfTextAtSize(
      direccionText,
      9,
    );
    page.drawText(direccionText, {
      x:
        margin +
        2 * firmaColumnWidth +
        (firmaColumnWidth - direccionTextWidth) / 2 +
        10,
      y: rowFirmasY + (cellHeight - 9) / 2 + 2,
      size: sizeNormal,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    let rowNuevaFilaY = rowFirmasY - cellHeight - 70;

    page.drawRectangle({
      x: margin,
      y: rowNuevaFilaY,
      width: firmaColumnWidth,
      height: cellHeight + 70,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    page.drawRectangle({
      x: margin + firmaColumnWidth,
      y: rowNuevaFilaY,
      width: firmaColumnWidth,
      height: cellHeight + 70,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    page.drawRectangle({
      x: margin + 2 * firmaColumnWidth,
      y: rowNuevaFilaY,
      width: firmaColumnWidth,
      height: cellHeight + 70,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    saveAs(blob, 'solicitud_de_permiso.pdf');
  }

  private truncateText(text: string, maxLength: number): string {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  }

  private formatearFecha(fecha: Date | string): string {
    const fechaConvertida = typeof fecha === 'string' ? new Date(fecha) : fecha;

    if (isNaN(fechaConvertida.getTime())) {
      throw new Error('La fecha proporcionada no es válida');
    }

    const dia = fechaConvertida.getUTCDate().toString().padStart(2, '0');
    const mes = (fechaConvertida.getUTCMonth() + 1).toString().padStart(2, '0');
    const anio = fechaConvertida.getUTCFullYear();

    return `${dia}/${mes}/${anio}`;
  }
}
