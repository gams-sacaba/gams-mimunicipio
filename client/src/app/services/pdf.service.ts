import { Injectable } from '@angular/core';
import { PDFDocument, rgb } from 'pdf-lib';
import * as fontkit from 'fontkit'; // Importamos fontkit
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
    reemplazo: any
  ) {
    //datos generales
    const nombres = datosGenerales.nombres || '';
    const apellidos = datosGenerales.apellidos || '';
    const ci = datosGenerales.ci || '';
    const telefono = datosGenerales.telefono || '';
    const cargo = datosGenerales.cargo || '';
    const registro = datosGenerales.registro || '';
    const unidad = datosGenerales.unidad || '';
    const dependencia = datosGenerales.dependencia || '';

    //datos detalle
    const dias = element.dias.map((dia: any) => {
      const fechaISO = dia.fecha.split('T')[0]; // "2025-04-01"
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
    //console.log('gestionFormateada: ', vacaciones);
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

    //datos reemplazo
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

    const cellHeight = 15; // Altura de cada celda (ajustar según necesidad)

    // Registra fontkit
    pdfDoc.registerFontkit(fontkit); // Registra fontkit para usar fuentes personalizadas

    // Cargar la fuente Verdana
    const verdanaBytes = await fetch('/assets/fonts/verdana.ttf').then((res) =>
      res.arrayBuffer()
    );
    const verdanaFont = await pdfDoc.embedFont(verdanaBytes);

    // Cargar la fuente Verdana Bold
    const verdanaBoldBytes = await fetch('/assets/fonts/verdana-bold.ttf').then(
      (res) => res.arrayBuffer()
    );
    const verdanaBoldFont = await pdfDoc.embedFont(verdanaBoldBytes);

    // Crear una página tamaño carta (21.59 cm x 27.94 cm)
    const page = pdfDoc.addPage([595.28, 841.89]); // Tamaño Carta (595.28 x 841.89 puntos)

    const margin = 28.35; // 1 cm = 28.35 puntos
    const pageWidth = page.getWidth();
    const pageHeight = page.getHeight();

    // Definir la altura de la fila y las columnas
    const rowHeight = 45;
    const columnWidth = (pageWidth - 2 * margin) / 3; // Dividido en 3 columnas

    // Dibujar la fila con borde
    page.drawRectangle({
      x: margin,
      y: pageHeight - margin - rowHeight,
      width: pageWidth - 2 * margin,
      height: rowHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
      color: rgb(1, 1, 1), // Fondo blanco
    });

    // Primera columna: Logo
    const logoBytes = await fetch('/assets/img/logo.png').then((res) =>
      res.arrayBuffer()
    );
    const logoImage = await pdfDoc.embedPng(logoBytes);
    const logoDims = logoImage.scale(0.1); // Redimensiona el logo si es necesario
    page.drawImage(logoImage, {
      x: margin + 5,
      y: pageHeight - margin - rowHeight + 5,
      width: logoDims.width,
      height: logoDims.height,
    });

    // Segunda columna: Título "SOLICITUD DE VACACIONES" (centrado)
    const titleText = 'SOLICITUD DE VACACIONES';
    const titleHeight = verdanaBoldFont.heightAtSize(12);
    page.drawText(titleText, {
      x: margin + columnWidth, // Centrado en la segunda columna
      y: pageHeight - margin - rowHeight + (rowHeight - titleHeight) / 2, // Centrado en el eje Y
      size: sizeTitle,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    // Tercera columna: "FOR-RH-001"
    const codeText = 'FOR-RH-001';
    const codeWidth = verdanaFont.widthOfTextAtSize(codeText, 8);
    page.drawText(codeText, {
      x: margin + 2 * columnWidth + columnWidth - codeWidth - 30, // Alineado a la derecha en la tercera columna
      y: pageHeight - margin - 15, // Parte superior de la celda
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    const codeDate = 'FECHA: ' + fechaSolicitud;
    const codeDateWith = verdanaFont.widthOfTextAtSize(codeDate, 8);
    page.drawText(codeDate, {
      x: margin + 2 * columnWidth + columnWidth - codeDateWith, // Alineado a la derecha en la tercera columna
      y: pageHeight - margin - 35, // Parte superior de la celda
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    /******** DATOS GENERALES ENCABEZADO **********/
    const datosGeneralesRowY = pageHeight - margin - rowHeight - 14.7;
    const datosGeneralesRowWidth = pageWidth - 2 * margin;

    page.drawRectangle({
      x: margin,
      y: datosGeneralesRowY,
      width: datosGeneralesRowWidth, // Usamos el mismo ancho total
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    const datosGeneralesText = 'DATOS GENERALES';
    const datosGeneralesTextWidth = verdanaBoldFont.widthOfTextAtSize(
      datosGeneralesText,
      9
    );

    page.drawText(datosGeneralesText, {
      x: margin + (datosGeneralesRowWidth - datosGeneralesTextWidth) / 2,
      y: datosGeneralesRowY + (cellHeight - 9) / 2 + 2,
      size: sizeNormal,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    /********* 1° FILA PARA DATO GENERALES *********/
    // Crear una nueva fila para los datos generales
    const rowDatosGeneralesY = datosGeneralesRowY - cellHeight;

    // Definimos los anchos personalizados para cada columna (en puntos)
    const columnWidths = [
      45, // Nombres
      110, // Valor de Nombres
      46, // Apellidos
      150, // Valor de Apellidos
      25, // C.I.
      64, // Valor de C.I.
      45, // Teléfono
      53.5, // Valor de Teléfono
    ];

    // Función para dibujar una celda con texto
    const drawCellWithText = (
      label: string,
      xPos: number,
      yPos: number,
      cellWidth: number
    ) => {
      // Dibujar la celda con borde
      page.drawRectangle({
        x: xPos,
        y: yPos,
        width: cellWidth,
        height: cellHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });

      // Dibujar el texto centrado verticalmente
      page.drawText(label, {
        x: xPos + 5, // Margen interno
        y: yPos + (cellHeight - sizeNormal) / 2,
        size: sizeNormal,
        font: verdanaFont,
        color: rgb(0, 0, 0),
      });
    };

    // Posición X inicial
    let xPos = margin;

    // Dibujar las 8 columnas con sus respectivos anchos personalizados
    drawCellWithText('Nombres:', xPos, rowDatosGeneralesY, columnWidths[0]);
    xPos += columnWidths[0]; // Avanzar a la siguiente posición de celda

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

    /****************** 2° FILA PARA DATOS GENERALES ***************/

    // Definimos la posición Y para la nueva fila
    const rowCargoY = rowDatosGeneralesY - cellHeight; // Debajo de la fila anterior

    // Definimos los anchos personalizados para las dos columnas
    const columnWidthsCargo = [
      34, // Ancho para "Cargo que desempeña:"
      pageWidth - 2 * margin - 34, // Ancho restante para el valor de `this.cargo`
    ];

    // Dibujar la primera columna: "Cargo que desempeña:"
    page.drawRectangle({
      x: margin,
      y: rowCargoY,
      width: columnWidthsCargo[0],
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    page.drawText('Cargo:', {
      x: margin + 5, // Margen interno
      y: rowCargoY + (cellHeight - sizeNormal) / 2, // Centrado verticalmente
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    // Dibujar la segunda columna: valor de `this.cargo`
    page.drawRectangle({
      x: margin + columnWidthsCargo[0],
      y: rowCargoY,
      width: columnWidthsCargo[1],
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    page.drawText(this.truncateText(cargo, 139), {
      x: margin + columnWidthsCargo[0] + 5, // Margen interno en la segunda columna
      y: rowCargoY + (cellHeight - sizeNormal) / 2, // Centrado verticalmente
      size: sizeMinimun,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    /****************** 3° FILA PARA DATOS GENERALES ***************/
    // Definimos la posición Y para la nueva fila
    const rowRegistroY = rowCargoY - cellHeight; // Justo debajo de la fila de "Cargo"

    // Definimos los anchos personalizados para las seis columnas
    const columnWidthsRegistro = [
      41, // Ancho para "N° Item:"
      33, // Ancho para `this.registro`
      35, // Ancho para "Unidad:"
      324, // Ancho para `this.unidad`
      58, // Ancho para "Dependencia:"
      pageWidth - 2 * margin - 491, // Ancho restante para `this.dependencia`
    ];

    // Dibujar la primera columna: "N° Item:"
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

    // Dibujar la segunda columna: `this.registro`
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

    // Dibujar la tercera columna: "Unidad:"
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

    // Dibujar la cuarta columna: `this.unidad`
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

    // Dibujar la quinta columna: "Dependencia:"
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

    // Dibujar la sexta columna: `this.dependencia`
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

    /****************** FILA PARA DETALLE******************** */

    const detalleRowY = rowDatosGeneralesY - 45; // Debajo de la tabla
    // Ancho total de la fila  (suma de todas las columnas)
    const detalleRowXWidth = pageWidth - 2 * margin;

    // Dibujar la celda de "DETALLE"
    page.drawRectangle({
      x: margin,
      y: detalleRowY,
      width: detalleRowXWidth, // Usamos el mismo ancho total
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // Texto "DETALLE" centrado
    const detalleText = 'DETALLE';
    const detalleTextWidth = verdanaBoldFont.widthOfTextAtSize(detalleText, 9);

    page.drawText(detalleText, {
      x: margin + (detalleRowXWidth - detalleTextWidth) / 2, // Centrado horizontalmente
      y: detalleRowY + (cellHeight - 9) / 2 + 2, // Centrado verticalmente
      size: sizeNormal,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    // Cuarta fila: Encabezado de la tabla (7 columnas)
    const row4Y = detalleRowY - 15; // Debajo de la fila de Cargo y N° registro

    const cellWidth = (pageWidth - 2 * margin) / 7; // Ancho dividido entre 7 columnas

    // Dibujar encabezados de la tabla
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
      // Omitir la columna separadora (índice 3)
      if (index === 3) {
        return; // Salir de esta iteración
      }
      const xPos = margin + index * cellWidth;
      page.drawText(header, {
        x: xPos + 2, // Un poco de margen dentro de la celda
        y: row4Y + cellHeight - 10, // Ajustar para centrar en la celda
        size: sizeMinimun,
        font: verdanaBoldFont,
        color: rgb(0, 0, 0),
      });
      // Dibujar la celda del encabezado
      page.drawRectangle({
        x: xPos,
        y: row4Y,
        width: cellWidth,
        height: cellHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });
    });

    // Dibujar las filas de datos (21 filas en total)
    for (let rowIndex = 0; rowIndex < 20; rowIndex++) {
      const rowY = row4Y - (rowIndex + 1) * cellHeight;

      for (let colIndex = 0; colIndex < 7; colIndex++) {
        const xPos = margin + colIndex * cellWidth;

        // Columna separadora (colIndex 3) se mantiene vacía
        if (colIndex === 3) {
          //   page.drawRectangle({
          //     x: xPos,
          //     y: rowY,
          //     width: cellWidth,
          //     height: cellHeight,
          //     borderColor: rgb(0, 0, 0),
          //     borderWidth: 1,
          //   });
          continue;
        }

        // Calcular el índice del elemento en `dias` para esta celda
        const dataIndex = rowIndex + (colIndex < 4 ? 0 : 20); // Cambia a segunda mitad después de la fila 21

        // Obtener el dato correspondiente
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

        // Dibujar el texto
        page.drawText(text || '', {
          x: xPos + 2,
          y: rowY + cellHeight - 10,
          size: sizeMinimun,
          font: verdanaFont,
          color: rgb(0, 0, 0),
        });

        // Dibujar la celda
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

    // Nueva fila para "TOTAL DÍAS SOLICITADOS" y "Saldo Días Vacación al:"
    const rowTotalDiasY = row4Y - 21 * cellHeight - 5; // Debajo de las 21 filas

    // Dibujar la celda combinada para "TOTAL DÍAS SOLICITADOS:"
    page.drawRectangle({
      x: margin,
      y: rowTotalDiasY,
      width: 3 * cellWidth, // Ancho combinado de las 3 primeras columnas
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // Texto "TOTAL DÍAS SOLICITADOS:"
    const totalDiasText = `TOTAL DÍAS SOLICITADOS: `;
    const totalDiasTextWidth = verdanaBoldFont.widthOfTextAtSize(
      totalDiasText,
      7
    );
    page.drawText(totalDiasText, {
      x: margin + (3 * cellWidth - totalDiasTextWidth) / 2 - 10, // Centrado
      y: rowTotalDiasY + (cellHeight - 6) / 2, // Centrado verticalmente
      size: sizeNormal,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    // Texto del valor de `total_dias`
    const totalDiasValue = `${dias_solicitados}`;
    page.drawText(totalDiasValue, {
      x: margin + 3 * cellWidth - totalDiasTextWidth + 40, // Alineado con separación
      y: rowTotalDiasY + (cellHeight - 6) / 2,
      size: sizeNormal,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    // // Dibujar la celda separadora (columna 4)
    // page.drawRectangle({
    //   x: margin + 3 * cellWidth,
    //   y: rowTotalDiasY,
    //   width: cellWidth,
    //   height: cellHeight,
    //   borderColor: rgb(0, 0, 0),
    //   borderWidth: 0,
    // });

    // Dibujar la celda combinada para "Saldo Días Vacación al:"
    page.drawRectangle({
      x: margin + 4 * cellWidth,
      y: rowTotalDiasY,
      width: 3 * cellWidth, // Ancho combinado de las columnas 5, 6 y 7
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // Texto "Saldo Días Vacación al:"
    const saldoDiasText =
      vacaciones.length === 2
        ? `Saldo Días Vacación de ` + `${fecha_pasada}: ${saldo_gestion_pasada}`
        : '';

    page.drawText(saldoDiasText, {
      x: margin + 4 * cellWidth + 5,
      y: rowTotalDiasY + (cellHeight - 9) / 2, // Centrado verticalmente
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    // Fila 1: Solo se dibuja la columna 7
    const rowSaldoY = rowTotalDiasY - cellHeight; // Justo debajo de la fila anterior

    page.drawRectangle({
      x: margin + 4 * cellWidth, // Posición de la columna 7
      y: rowSaldoY,
      width: 3 * cellWidth, // Ancho de la celda
      height: cellHeight, // Altura de la celda
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // Texto "Saldo Días Vacación al:" en la columna 7
    const saldoDiasText_2 =
      `Saldo Días Vacación de ` + `${fecha_actual}: ${saldo_gestion_actual}`;

    page.drawText(saldoDiasText_2, {
      x: margin + 4 * cellWidth + 5, // Espaciado dentro de la celda
      y: rowSaldoY + (cellHeight - 9) / 2, // Centrado verticalmente
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    // Fila 2: Solo se dibuja la columna 7
    const rowTotalVacacionY = rowSaldoY - cellHeight; // Justo debajo de la fila anterior

    page.drawRectangle({
      x: margin + 4 * cellWidth, // Posición de la columna 7
      y: rowTotalVacacionY,
      width: 3 * cellWidth, // Ancho de la celda
      height: cellHeight, // Altura de la celda
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // Texto "Total días vacación:" en la columna 7
    const totalVacacionText = `TOTAL DÍAS DISPONIBLES: ` + dias_disponibles;
    const totalVacacionTextWidth = verdanaBoldFont.widthOfTextAtSize(
      totalVacacionText,
      9
    );
    page.drawText(totalVacacionText, {
      x: margin + (12 * cellWidth - totalVacacionTextWidth) / 2 - 15, // Espaciado dentro de la celda
      y: rowTotalVacacionY + (cellHeight - 6) / 2, // Centrado verticalmente
      size: sizeNormal,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    // Texto del valor de `total_dias` en la columna 7
    // page.drawText(`${this.total_dias}`, {
    //   x: margin + 6 * cellWidth + 5 + totalVacacionTextWidth + 5, // Alineado después del texto
    //   y: rowTotalVacacionY + (cellHeight - 9) / 2,
    //   size: 9,
    //   font: verdanaFont,
    //   color: rgb(0, 0, 0),
    // });

    /************* FILA "DETALLE DE PERSONAL DE REEMPLAZO"******** */
    const detalleReemplazoRowY = rowTotalVacacionY - 20; // Debajo de la tabla
    // Ancho total de la fila  (suma de todas las columnas)
    const detalleRowWidth = pageWidth - 2 * margin;

    // Dibujar la celda de "DETALLE DE PERSONAL DE REEMPLAZO"
    page.drawRectangle({
      x: margin,
      y: detalleReemplazoRowY,
      width: detalleRowWidth, // Usamos el mismo ancho total
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // Texto "DETALLE DE PERSONAL DE REEMPLAZO" centrado
    const detalleReemplazoText = 'PERSONAL DE REEMPLAZO';
    const detalleReemplazoTextWidth = verdanaBoldFont.widthOfTextAtSize(
      detalleReemplazoText,
      9
    );

    page.drawText(detalleReemplazoText, {
      x: margin + (detalleRowWidth - detalleReemplazoTextWidth) / 2, // Centrado horizontalmente
      y: detalleReemplazoRowY + (cellHeight - 9) / 2 + 2, // Centrado verticalmente
      size: sizeNormal,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    /********** 1° FILA "DETALLE DE PERSONAL DE REEMPLAZO"**********/
    const rowReemplazoY = detalleReemplazoRowY - cellHeight;

    // Definimos los anchos personalizados para cada columna (en puntos)
    const columnWidthsReemplazo = [
      45, // Nombres
      110, // Valor de Nombres
      46, // Apellidos
      150, // Valor de Apellidos
      25, // C.I.
      64, // Valor de C.I.
      45, // Teléfono
      53.5, // Valor de Teléfono
    ];

    // Función para dibujar una celda con texto
    const drawCellWithTextReemplazo = (
      label: string,
      xPosR: number,
      yPosR: number,
      cellWidth: number
    ) => {
      // Dibujar la celda con borde
      page.drawRectangle({
        x: xPosR,
        y: yPosR,
        width: cellWidth,
        height: cellHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });

      // Dibujar el texto centrado verticalmente
      page.drawText(label, {
        x: xPosR + 5, // Margen interno
        y: yPosR + (cellHeight - sizeNormal) / 2,
        size: sizeNormal,
        font: verdanaFont,
        color: rgb(0, 0, 0),
      });
    };

    // Posición X inicial
    let xPosR = margin;

    // Dibujar las 8 columnas con sus respectivos anchos personalizados
    drawCellWithTextReemplazo(
      'Nombres:',
      xPosR,
      rowReemplazoY,
      columnWidthsReemplazo[0]
    );
    xPosR += columnWidthsReemplazo[0]; // Avanzar a la siguiente posición de celda

    drawCellWithTextReemplazo(
      nombresReemplazo,
      xPosR,
      rowReemplazoY,
      columnWidthsReemplazo[1]
    );
    xPosR += columnWidthsReemplazo[1];

    drawCellWithTextReemplazo(
      'Apellidos:',
      xPosR,
      rowReemplazoY,
      columnWidthsReemplazo[2]
    );
    xPosR += columnWidthsReemplazo[2];

    drawCellWithTextReemplazo(
      apellidosReemplazo,
      xPosR,
      rowReemplazoY,
      columnWidthsReemplazo[3]
    );
    xPosR += columnWidthsReemplazo[3];

    drawCellWithTextReemplazo(
      'C.I.:',
      xPosR,
      rowReemplazoY,
      columnWidthsReemplazo[4]
    );
    xPosR += columnWidthsReemplazo[4];

    drawCellWithTextReemplazo(
      ciReemplazo,
      xPosR,
      rowReemplazoY,
      columnWidthsReemplazo[5]
    );
    xPosR += columnWidthsReemplazo[5];

    drawCellWithTextReemplazo(
      'Teléfono:',
      xPosR,
      rowReemplazoY,
      columnWidthsReemplazo[6]
    );
    xPosR += columnWidthsReemplazo[6];

    drawCellWithTextReemplazo(
      telefonoReemplazo,
      xPosR,
      rowReemplazoY,
      columnWidthsReemplazo[7]
    );

    /*********** 2° FILA "DETALLE DE PERSONAL DE REEMPLAZO"*******/

    // Definimos la posición Y para la nueva fila
    const rowCargoDetalleY = rowReemplazoY - cellHeight; // Debajo de la fila anterior

    // Definimos los anchos personalizados para las dos columnas
    const columnWidthsCargoDetalle = [
      34, // Ancho para "Cargo que desempeña:"
      pageWidth - 2 * margin - 34, // Ancho restante para el valor de `this.cargo`
    ];

    // Dibujar la primera columna: "Cargo que desempeña:"
    page.drawRectangle({
      x: margin,
      y: rowCargoDetalleY,
      width: columnWidthsCargoDetalle[0],
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    page.drawText('Cargo:', {
      x: margin + 5, // Margen interno
      y: rowCargoDetalleY + (cellHeight - sizeNormal) / 2, // Centrado verticalmente
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    // Dibujar la segunda columna: valor de `this.cargo`
    page.drawRectangle({
      x: margin + columnWidthsCargoDetalle[0],
      y: rowCargoDetalleY,
      width: columnWidthsCargoDetalle[1],
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    page.drawText(this.truncateText(cargoReemplazo, 139), {
      x: margin + columnWidthsCargoDetalle[0] + 5, // Margen interno en la segunda columna
      y: rowCargoDetalleY + (cellHeight - sizeNormal) / 2, // Centrado verticalmente
      size: sizeMinimun,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    /********** FILA PARA SOLICITANTE Y JEFE ********** */
    const rowFirmasY = rowCargoDetalleY - cellHeight;
    // Ancho de cada columna (mitad del ancho total)
    const firmaColumnWidth = detalleRowWidth / 2;

    // Dibujar la celda para "Solicitante"
    page.drawRectangle({
      x: margin,
      y: rowFirmasY,
      width: firmaColumnWidth,
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // Texto "Solicitante" centrado
    const solicitanteText = 'Solicitante';
    const solicitanteTextWidth = verdanaBoldFont.widthOfTextAtSize(
      solicitanteText,
      9
    );
    page.drawText(solicitanteText, {
      x: margin + (firmaColumnWidth - solicitanteTextWidth) / 2, // Centrado horizontalmente
      y: rowFirmasY + (cellHeight - 9) / 2 + 2, // Centrado verticalmente
      size: sizeNormal,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    // Dibujar la celda para "Jefe Inmediato Superior"
    page.drawRectangle({
      x: margin + firmaColumnWidth,
      y: rowFirmasY,
      width: firmaColumnWidth,
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // Texto "Jefe Inmediato Superior" centrado
    const jefeText = 'Jefe Inmediato Superior';
    const jefeTextWidth = verdanaBoldFont.widthOfTextAtSize(jefeText, 9);
    page.drawText(jefeText, {
      x: margin + firmaColumnWidth + (firmaColumnWidth - jefeTextWidth) / 2, // Centrado horizontalmente
      y: rowFirmasY + (cellHeight - 9) / 2 + 2, // Centrado verticalmente
      size: sizeNormal,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    // Fila debajo de "Solicitante" y "Jefe Inmediato Superior"
    const rowFechaY = rowFirmasY - cellHeight; // Justo debajo de la fila anterior

    // Dibujar la celda para "Fecha de Solicitud"
    page.drawRectangle({
      x: margin,
      y: rowFechaY,
      width: firmaColumnWidth,
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // Texto "Fecha de Solicitud:"
    const fechaSolicitudLabel = 'Fecha de Solicitud: ';
    page.drawText(fechaSolicitudLabel, {
      x: margin + 5,
      y: rowFechaY + (cellHeight - 9) / 2,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    // Cuadrado para "Fecha de Solicitud"
    const fechaSolicitudLabelWidth = verdanaFont.widthOfTextAtSize(
      fechaSolicitudLabel,
      9
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

    // Dibujar la celda para "Fecha de Aprobación"
    page.drawRectangle({
      x: margin + firmaColumnWidth,
      y: rowFechaY,
      width: firmaColumnWidth,
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // Texto "Fecha de Aprobación:"
    const fechaAprobacionLabel = 'Fecha de Aprobación: ';
    const aprobacionX = margin + firmaColumnWidth + 5;
    page.drawText(fechaAprobacionLabel, {
      x: aprobacionX,
      y: rowFechaY + (cellHeight - 9) / 2,
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    // Cuadrado para "Fecha de Aprobación"
    const fechaAprobacionLabelWidth = verdanaFont.widthOfTextAtSize(
      fechaAprobacionLabel,
      9
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

    // Fila debajo de "Fecha de Solicitud" y "Fecha de Aprobación"
    const rowFirmasFinalY = rowFechaY - cellHeight; // Justo debajo de la fila anterior

    // Dibujar la celda para "Firma del Solicitante"
    page.drawRectangle({
      x: margin,
      y: rowFirmasFinalY,
      width: firmaColumnWidth,
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // Texto "Firma del Solicitante" centrado
    const firmaSolicitanteText = 'Firma del Solicitante';
    const firmaSolicitanteTextWidth = verdanaFont.widthOfTextAtSize(
      firmaSolicitanteText,
      9
    );
    page.drawText(firmaSolicitanteText, {
      x: margin + (firmaColumnWidth - firmaSolicitanteTextWidth) / 2, // Centrado horizontalmente
      y: rowFirmasFinalY + (cellHeight - 9) / 2, // Centrado verticalmente
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    // Dibujar la celda para "Firma de Aprobación"
    page.drawRectangle({
      x: margin + firmaColumnWidth,
      y: rowFirmasFinalY,
      width: firmaColumnWidth,
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // Texto "Firma de Aprobación" centrado
    const firmaAprobacionText = 'Firma de Aprobación';
    const firmaAprobacionTextWidth = verdanaFont.widthOfTextAtSize(
      firmaAprobacionText,
      9
    );
    page.drawText(firmaAprobacionText, {
      x:
        margin +
        firmaColumnWidth +
        (firmaColumnWidth - firmaAprobacionTextWidth) / 2, // Centrado horizontalmente
      y: rowFirmasFinalY + (cellHeight - 9) / 2, // Centrado verticalmente
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    // Fila vacía debajo de "Firma de Aprobación"
    const rowNuevaFilaY = rowFirmasFinalY - cellHeight - 70; // Justo debajo de la fila anterior

    // Dibujar la celda vacía para la primera columna
    page.drawRectangle({
      x: margin,
      y: rowNuevaFilaY,
      width: firmaColumnWidth,
      height: cellHeight + 70,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // Dibujar la celda vacía para la segunda columna
    page.drawRectangle({
      x: margin + firmaColumnWidth,
      y: rowNuevaFilaY,
      width: firmaColumnWidth,
      height: cellHeight + 70,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // Guardamos el PDF
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    saveAs(blob, 'solicitud_de_vacaciones.pdf');
  }

  async generateExcepcion(datosGenerales: any, element: any, contrato: any) {
    //datos generales
    // console.log('datosGenerales: ', datosGenerales);
    // console.log('element: ', element);
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

    let cellHeight = 15; // Altura de cada celda (ajustar según necesidad)

    // Registra fontkit
    pdfDoc.registerFontkit(fontkit); // Registra fontkit para usar fuentes personalizadas

    // Cargar la fuente Verdana
    let verdanaBytes = await fetch('/assets/fonts/verdana.ttf').then((res) =>
      res.arrayBuffer()
    );
    let verdanaFont = await pdfDoc.embedFont(verdanaBytes);

    // Cargar la fuente Verdana Bold
    let verdanaBoldBytes = await fetch('/assets/fonts/verdana-bold.ttf').then(
      (res) => res.arrayBuffer()
    );
    let verdanaBoldFont = await pdfDoc.embedFont(verdanaBoldBytes);

    // Crear una página tamaño carta (21.59 cm x 27.94 cm)
    let page = pdfDoc.addPage([595.28, 841.89]); // Tamaño Carta (595.28 x 841.89 puntos)

    let margin = 28.35; // 1 cm = 28.35 puntos
    let pageWidth = page.getWidth();
    let pageHeight = page.getHeight();

    // Definir la altura de la fila y las columnas
    let rowHeight = 45;
    let columnWidth = (pageWidth - 2 * margin) / 3; // Dividido en 3 columnas

    // Dibujar la fila con borde
    page.drawRectangle({
      x: margin,
      y: pageHeight - margin - rowHeight,
      width: pageWidth - 2 * margin,
      height: rowHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
      color: rgb(1, 1, 1), // Fondo blanco
    });

    // Primera columna: Logo
    let logoBytes = await fetch('/assets/img/logo.png').then((res) =>
      res.arrayBuffer()
    );
    let logoImage = await pdfDoc.embedPng(logoBytes);
    let logoDims = logoImage.scale(0.1); // Redimensiona el logo si es necesario
    page.drawImage(logoImage, {
      x: margin + 5,
      y: pageHeight - margin - rowHeight + 5,
      width: logoDims.width,
      height: logoDims.height,
    });

    // Segunda columna: Título (centrado)
    let titleHeight = verdanaBoldFont.heightAtSize(12);
    page.drawText(titleText, {
      x: margin + columnWidth - 40, // Centrado en la segunda columna
      y: pageHeight - margin - rowHeight + (rowHeight - titleHeight) / 2, // Centrado en el eje Y
      size: sizeTitle,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    // Tercera columna: "FOR-RH-001"
    let codeText = 'Form SAC003';
    let codeWidth = verdanaFont.widthOfTextAtSize(codeText, 8);
    page.drawText(codeText, {
      x: margin + 2 * columnWidth + columnWidth - codeWidth - 26.5, // Alineado a la derecha en la tercera columna
      y: pageHeight - margin - 15, // Parte superior de la celda
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    let codeDate = 'FECHA: ' + fechaSolicitud;
    let codeDateWith = verdanaFont.widthOfTextAtSize(codeDate, 8);
    page.drawText(codeDate, {
      x: margin + 2 * columnWidth + columnWidth - codeDateWith, // Alineado a la derecha en la tercera columna
      y: pageHeight - margin - 35, // Parte superior de la celda
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    /******** DATOS GENERALES ENCABEZADO **********/
    let datosGeneralesRowY = pageHeight - margin - rowHeight - 14.7;
    let datosGeneralesRowWidth = pageWidth - 2 * margin;

    page.drawRectangle({
      x: margin,
      y: datosGeneralesRowY,
      width: datosGeneralesRowWidth, // Usamos el mismo ancho total
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    let datosGeneralesText = 'DATOS GENERALES';
    let datosGeneralesTextWidth = verdanaBoldFont.widthOfTextAtSize(
      datosGeneralesText,
      9
    );

    page.drawText(datosGeneralesText, {
      x: margin + (datosGeneralesRowWidth - datosGeneralesTextWidth) / 2,
      y: datosGeneralesRowY + (cellHeight - 9) / 2 + 2,
      size: sizeNormal,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    /********* 1° FILA PARA DATO GENERALES *********/
    // Crear una nueva fila para los datos generales
    let rowDatosGeneralesY = datosGeneralesRowY - cellHeight;

    // Definimos los anchos personalizados para cada columna (en puntos)
    let columnWidths = [
      45, // Nombres
      110, // Valor de Nombres
      46, // Apellidos
      150, // Valor de Apellidos
      25, // C.I.
      64, // Valor de C.I.
      45, // Teléfono
      53.5, // Valor de Teléfono
    ];

    // Función para dibujar una celda con texto
    let drawCellWithText = (
      label: string,
      xPos: number,
      yPos: number,
      cellWidth: number
    ) => {
      // Dibujar la celda con borde
      page.drawRectangle({
        x: xPos,
        y: yPos,
        width: cellWidth,
        height: cellHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });

      // Dibujar el texto centrado verticalmente
      page.drawText(label, {
        x: xPos + 5, // Margen interno
        y: yPos + (cellHeight - sizeNormal) / 2,
        size: sizeNormal,
        font: verdanaFont,
        color: rgb(0, 0, 0),
      });
    };

    // Posición X inicial
    let xPos = margin;

    // Dibujar las 8 columnas con sus respectivos anchos personalizados
    drawCellWithText('Nombres:', xPos, rowDatosGeneralesY, columnWidths[0]);
    xPos += columnWidths[0]; // Avanzar a la siguiente posición de celda

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

    /****************** 2° FILA PARA DATOS GENERALES ***************/

    // Definimos la posición Y para la nueva fila
    let rowCargoY = rowDatosGeneralesY - cellHeight; // Debajo de la fila anterior

    // Definimos los anchos personalizados para las dos columnas
    let columnWidthsCargo = [
      34, // Ancho para "Cargo que desempeña:"
      pageWidth - 2 * margin - 34, // Ancho restante para el valor de `this.cargo`
    ];

    // Dibujar la primera columna: "Cargo que desempeña:"
    page.drawRectangle({
      x: margin,
      y: rowCargoY,
      width: columnWidthsCargo[0],
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    page.drawText('Cargo:', {
      x: margin + 5, // Margen interno
      y: rowCargoY + (cellHeight - sizeNormal) / 2, // Centrado verticalmente
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    // Dibujar la segunda columna: valor de `this.cargo`
    page.drawRectangle({
      x: margin + columnWidthsCargo[0],
      y: rowCargoY,
      width: columnWidthsCargo[1],
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    page.drawText(this.truncateText(cargo, 139), {
      x: margin + columnWidthsCargo[0] + 5, // Margen interno en la segunda columna
      y: rowCargoY + (cellHeight - sizeNormal) / 2, // Centrado verticalmente
      size: sizeMinimun,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    /****************** 3° FILA PARA DATOS GENERALES ***************/
    // Definimos la posición Y para la nueva fila
    let rowRegistroY = rowCargoY - cellHeight; // Justo debajo de la fila de "Cargo"

    // Definimos los anchos personalizados para las seis columnas
    let columnWidthsRegistro = [
      55, // Ancho para "N° Item:"
      33, // Ancho para `this.registro`
      35, // Ancho para "Unidad:"
      310, // Ancho para `this.unidad`
      58, // Ancho para "Dependencia:"
      pageWidth - 2 * margin - 491, // Ancho restante para `this.dependencia`
    ];

    // Dibujar la primera columna: "N° Item:"
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

    // Dibujar la segunda columna: `this.registro`
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

    // Dibujar la tercera columna: "Unidad:"
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

    // Dibujar la cuarta columna: `this.unidad`
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

    // Dibujar la quinta columna: "Dependencia:"
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

    // Dibujar la sexta columna: `this.dependencia`
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

    /****************** FILA PARA DETALLE******************** */

    let detalleRowY = rowDatosGeneralesY - 45; // Debajo de la tabla
    // Ancho total de la fila  (suma de todas las columnas)
    let detalleRowXWidth = pageWidth - 2 * margin;

    // Dibujar la celda de "DETALLE"
    page.drawRectangle({
      x: margin,
      y: detalleRowY,
      width: detalleRowXWidth, // Usamos el mismo ancho total
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // Texto "DETALLE" centrado
    let detalleText = 'SALIDA';
    let detalleTextWidth = verdanaBoldFont.widthOfTextAtSize(detalleText, 9);

    page.drawText(detalleText, {
      x: margin + (detalleRowXWidth - detalleTextWidth) / 2, // Centrado horizontalmente
      y: detalleRowY + (cellHeight - 9) / 2 + 2, // Centrado verticalmente
      size: sizeNormal,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    // Cuarta fila: Encabezado de la tabla (7 columnas)
    let row4Y = detalleRowY - 15; // Debajo de la fila de Cargo y N° registro

    let cellWidth = (pageWidth - 2 * margin) / 7; // Ancho dividido entre 7 columnas

    // Nueva fila para "TOTAL DÍAS SOLICITADOS" y "Saldo Días Vacación al:"
    let rowTotalDiasY = row4Y - 21; // Debajo de las 21 filas

    // Dibujar la celda combinada para "SELLO"
    page.drawRectangle({
      x: margin,
      y: rowTotalDiasY - 76,
      width: 3 * cellWidth, // Ancho combinado de las 3 primeras columnas
      height: cellHeight * 7 + 3,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // Texto "SELLO DEL LUGAR VISITADO "
    let totalDiasText = `SELLO DEL LUGAR VISITADO`;
    let totalDiasTextWidth = verdanaFont.widthOfTextAtSize(totalDiasText, 7);
    page.drawText(totalDiasText, {
      x: margin + cellWidth - 4, // Centrado
      y: rowTotalDiasY - 20, // Centrado verticalmente
      size: sizeMinimun,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    page.drawRectangle({
      x: margin + 3 * cellWidth + 3,
      y: rowTotalDiasY + 17.5,
      width: 1 * cellWidth - 9, // Ancho combinado de las columnas 5, 6 y 7
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    let fechaTitulo = `Fecha de Salida:`;

    page.drawText(fechaTitulo, {
      x: margin + 3 * cellWidth + 8,
      y: rowTotalDiasY + 21.5, // Centrado verticalmente
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    page.drawText(fechaSalida, {
      x: margin + 3 * cellWidth + 75,
      y: rowTotalDiasY + 21.5, // Centrado verticalmente
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    page.drawRectangle({
      x: margin + 3 * cellWidth + 125,
      y: rowTotalDiasY + 17.5,
      width: 65, // Ancho combinado de las columnas 5, 6 y 7
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    let horaTitulo = `Hora Excepción:`;

    page.drawText(horaTitulo, {
      x: margin + 3 * cellWidth + 129,
      y: rowTotalDiasY + 21.5, // Centrado verticalmente
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

    // Texto "Saldo Días Vacación al:"
    let saldoDiasText = `De hrs.: ${horaInicio}   A hrs.: ${horaFin}`;

    page.drawText(saldoDiasText, {
      x: margin + 5 * cellWidth + 40,
      y: rowTotalDiasY + 21.5, // Centrado verticalmente
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    // Fila 1: Solo se dibuja la columna 7
    let rowSaldoY = rowTotalDiasY - cellHeight; // Justo debajo de la fila anterior

    page.drawRectangle({
      x: margin + 3 * cellWidth + 3, // Posición de la columna 7
      y: rowSaldoY + 17.5 - 3,
      width: 4 * cellWidth - 3, // Ancho de la celda
      height: cellHeight, // Altura de la celda
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // Texto "Saldo Días Vacación al:" en la columna 7
    let saldoDiasText_2 = `Motivo`;

    page.drawText(saldoDiasText_2, {
      x: margin + 4 * cellWidth + 61, // Espaciado dentro de la celda
      y: rowSaldoY + 19, // Centrado verticalmente
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    // Fila 2: Solo se dibuja la columna 7
    let rowTotalVacacionY = rowSaldoY - cellHeight; // Justo debajo de la fila anterior

    // Parámetros del rectángulo
    let rectX = margin + 3 * cellWidth + 3; // Posición X
    let rectY = rowTotalVacacionY - 46.5; // Posición Y
    let rectWidth = 4 * cellWidth - 3; // Ancho del rectángulo
    let rectHeight = cellHeight * 4 + 16; // Altura del rectángulo
    let lineHeight = 10; // Altura de cada línea de texto
    let padding = 5; // Espaciado dentro del rectángulo

    // Dibujar el rectángulo
    page.drawRectangle({
      x: rectX,
      y: rectY,
      width: rectWidth,
      height: rectHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // Dividir el texto en líneas
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

    // Dibujar las líneas de texto
    let currentY = rectY + rectHeight - lineHeight - padding; // Coordenada Y inicial
    textLines.forEach((line) => {
      if (currentY > rectY + padding) {
        page.drawText(line, {
          x: rectX + padding,
          y: currentY,
          size: sizeNormal,
          font: verdanaFont,
          color: rgb(0, 0, 0),
        });
        currentY -= lineHeight; // Moverse a la siguiente línea
      }
    });

    /************* FILA "DETALLE DE PERSONAL DE REEMPLAZO"******** */
    let detalleReemplazoRowY = rowTotalVacacionY - 20; // Debajo de la tabla
    // Ancho total de la fila  (suma de todas las columnas)
    let detalleRowWidth = pageWidth - 2 * margin;

    /********** 1° FILA "DETALLE DE PERSONAL DE REEMPLAZO"**********/
    let rowReemplazoY = detalleReemplazoRowY - cellHeight;

    /*********** 2° FILA "DETALLE DE PERSONAL DE REEMPLAZO"*******/

    // Definimos la posición Y para la nueva fila
    let rowCargoDetalleY = rowReemplazoY - cellHeight; // Debajo de la fila anterior

    // Definimos los anchos personalizados para las dos columnas
    let columnWidthsCargoDetalle = [
      34, // Ancho para "Cargo que desempeña:"
      pageWidth - 2 * margin - 34, // Ancho restante para el valor de `this.cargo`
    ];

    /********** FILA PARA SOLICITANTE Y JEFE ********** */
    let rowFirmasY = rowCargoDetalleY - cellHeight;
    // Ancho de cada columna (dividido en tres partes iguales)
    let firmaColumnWidth = detalleRowWidth / 3;

    // Dibujar la celda para "Solicitante"
    page.drawRectangle({
      x: margin,
      y: rowFirmasY,
      width: firmaColumnWidth,
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // Texto "Solicitante" centrado
    let solicitanteText = 'Solicitante';
    let solicitanteTextWidth = verdanaBoldFont.widthOfTextAtSize(
      solicitanteText,
      9
    );
    page.drawText(solicitanteText, {
      x: margin + (firmaColumnWidth - solicitanteTextWidth) / 2 + 5, // Centrado horizontalmente
      y: rowFirmasY + (cellHeight - 9) / 2 + 2, // Centrado verticalmente
      size: sizeNormal,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    // Dibujar la celda para "Jefe Inmediato Superior"
    page.drawRectangle({
      x: margin + firmaColumnWidth,
      y: rowFirmasY,
      width: firmaColumnWidth,
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // Texto "Jefe Inmediato Superior" centrado
    let jefeText = 'Inmediato Superior';
    let jefeTextWidth = verdanaBoldFont.widthOfTextAtSize(jefeText, 9);
    page.drawText(jefeText, {
      x:
        margin + firmaColumnWidth + (firmaColumnWidth - jefeTextWidth) / 2 + 10, // Centrado horizontalmente
      y: rowFirmasY + (cellHeight - 9) / 2 + 2, // Centrado verticalmente
      size: sizeNormal,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    // Dibujar la celda para "Dirección Adm. y RRHH"
    page.drawRectangle({
      x: margin + 2 * firmaColumnWidth,
      y: rowFirmasY,
      width: firmaColumnWidth,
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // Texto "Dirección Adm. y RRHH" centrado
    let direccionText = 'Dirección Adm. y RRHH';
    let direccionTextWidth = verdanaBoldFont.widthOfTextAtSize(
      direccionText,
      9
    );
    page.drawText(direccionText, {
      x:
        margin +
        2 * firmaColumnWidth +
        (firmaColumnWidth - direccionTextWidth) / 2 +
        10, // Centrado horizontalmente
      y: rowFirmasY + (cellHeight - 9) / 2 + 2, // Centrado verticalmente
      size: sizeNormal,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    // Fila vacía debajo de las tres columnas
    let rowNuevaFilaY = rowFirmasY - cellHeight - 70; // Justo debajo de la fila anterior

    // Dibujar la celda vacía para la primera columna
    page.drawRectangle({
      x: margin,
      y: rowNuevaFilaY,
      width: firmaColumnWidth,
      height: cellHeight + 70,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // Dibujar la celda vacía para la segunda columna
    page.drawRectangle({
      x: margin + firmaColumnWidth,
      y: rowNuevaFilaY,
      width: firmaColumnWidth,
      height: cellHeight + 70,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // Dibujar la celda vacía para la tercera columna
    page.drawRectangle({
      x: margin + 2 * firmaColumnWidth,
      y: rowNuevaFilaY,
      width: firmaColumnWidth,
      height: cellHeight + 70,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // Divisor de página
    page.drawRectangle({
      x: 0,
      y: pageHeight / 2,
      width: pageWidth,
      height: 1,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    page.drawText(note, {
      x: margin + 10, // Alineado a la derecha en la tercera columna
      y: rowNuevaFilaY - 15, // Parte superior de la celda
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    page.drawText(noteContinuos, {
      x: margin + 37, // Alineado a la derecha en la tercera columna
      y: rowNuevaFilaY - 25, // Parte superior de la celda
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    /********************************
     *  !!! IMPORTANTE COPIA REPLICA !!!
     * *********************************/

    let midPageY = pageHeight / 2;

    let secondPageRowY = pageHeight - margin - rowHeight - midPageY;
    // Dibujar la fila con borde
    page.drawRectangle({
      x: margin,
      y: secondPageRowY,
      width: pageWidth - 2 * margin,
      height: rowHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
      color: rgb(1, 1, 1), // Fondo blanco
    });

    // Primera columna: Logo
    page.drawImage(logoImage, {
      x: margin + 5,
      y: secondPageRowY + 5,
      width: logoDims.width,
      height: logoDims.height,
    });

    // Segunda columna: Título "SOLICITUD DE EXCEPCIÓN DE TICKEO" (centrado)

    page.drawText(titleText, {
      x: margin + columnWidth - 40, // Centrado en la segunda columna
      y: secondPageRowY + (rowHeight - titleHeight) / 2, // Centrado en el eje Y
      size: sizeTitle,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    // Tercera columna: "FOR-RH-001"
    let nameForm = pageHeight - margin - midPageY;
    page.drawText(codeText, {
      x: margin + 2 * columnWidth + columnWidth - codeWidth - 26.5, // Alineado a la derecha en la tercera columna
      y: nameForm - 15, // Parte superior de la celda
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    // Cuarta columna; fecha
    page.drawText(codeDate, {
      x: margin + 2 * columnWidth + columnWidth - codeDateWith, // Alineado a la derecha en la tercera columna
      y: nameForm - 35, // Parte superior de la celda
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    //     /******** DATOS GENERALES ENCABEZADO **********/
    datosGeneralesRowY = pageHeight - margin - rowHeight - 14.7 - midPageY;
    //      datosGeneralesRowWidth = pageWidth - 2 * margin;

    page.drawRectangle({
      x: margin,
      y: datosGeneralesRowY,
      width: datosGeneralesRowWidth, // Usamos el mismo ancho total
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

    //     /********* 1° FILA PARA DATO GENERALES *********/
    //     // Crear una nueva fila para los datos generales
    rowDatosGeneralesY = datosGeneralesRowY - cellHeight;

    // Función para dibujar una celda con texto
    drawCellWithText = (
      label: string,
      xPos: number,
      yPos: number,
      cellWidth: number
    ) => {
      // Dibujar la celda con borde
      page.drawRectangle({
        x: xPos,
        y: yPos,
        width: cellWidth,
        height: cellHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });

      // Dibujar el texto centrado verticalmente
      page.drawText(label, {
        x: xPos + 5, // Margen interno
        y: yPos + (cellHeight - sizeNormal) / 2,
        size: sizeNormal,
        font: verdanaFont,
        color: rgb(0, 0, 0),
      });
    };

    //     // Posición X inicial
    xPos = margin;

    //     // Dibujar las 8 columnas con sus respectivos anchos personalizados
    drawCellWithText('Nombres:', xPos, rowDatosGeneralesY, columnWidths[0]);
    xPos += columnWidths[0]; // Avanzar a la siguiente posición de celda

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

    //     /****************** 2° FILA PARA DATOS GENERALES ***************/

    //     // Definimos la posición Y para la nueva fila
    rowCargoY = rowDatosGeneralesY - cellHeight; // Debajo de la fila anterior

    //     // Dibujar la primera columna: "Cargo que desempeña:"
    page.drawRectangle({
      x: margin,
      y: rowCargoY,
      width: columnWidthsCargo[0],
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    page.drawText('Cargo:', {
      x: margin + 5, // Margen interno
      y: rowCargoY + (cellHeight - sizeNormal) / 2, // Centrado verticalmente
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    //     // Dibujar la segunda columna: valor de `this.cargo`
    page.drawRectangle({
      x: margin + columnWidthsCargo[0],
      y: rowCargoY,
      width: columnWidthsCargo[1],
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    page.drawText(this.truncateText(cargo, 139), {
      x: margin + columnWidthsCargo[0] + 5, // Margen interno en la segunda columna
      y: rowCargoY + (cellHeight - sizeNormal) / 2, // Centrado verticalmente
      size: sizeMinimun,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    //     /****************** 3° FILA PARA DATOS GENERALES ***************/
    //     // Definimos la posición Y para la nueva fila
    rowRegistroY = rowCargoY - cellHeight; // Justo debajo de la fila de "Cargo"

    //     // Dibujar la primera columna: "N° Item:"
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

    //     // Dibujar la segunda columna: `this.registro`
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

    //     // Dibujar la tercera columna: "Unidad:"
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

    //     // Dibujar la cuarta columna: `this.unidad`
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

    //     // Dibujar la quinta columna: "Dependencia:"
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

    //     // Dibujar la sexta columna: `this.dependencia`
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

    //     /****************** FILA PARA DETALLE******************** */

    detalleRowY = rowDatosGeneralesY - 45; // Debajo de la tabla
    //     // Ancho total de la fila  (suma de todas las columnas)
    //      detalleRowXWidth = pageWidth - 2 * margin;

    //     // Dibujar la celda de "DETALLE"
    page.drawRectangle({
      x: margin,
      y: detalleRowY,
      width: detalleRowXWidth, // Usamos el mismo ancho total
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    page.drawText(detalleText, {
      x: margin + (detalleRowXWidth - detalleTextWidth) / 2, // Centrado horizontalmente
      y: detalleRowY + (cellHeight - 9) / 2 + 2, // Centrado verticalmente
      size: sizeNormal,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    //     // Cuarta fila: Encabezado de la tabla (7 columnas)
    row4Y = detalleRowY - 15; // Debajo de la fila de Cargo y N° registro

    //      cellWidth = (pageWidth - 2 * margin) / 7; // Ancho dividido entre 7 columnas

    //     // Nueva fila para "TOTAL DÍAS SOLICITADOS" y "Saldo Días Vacación al:"
    rowTotalDiasY = row4Y - 21; // Debajo de las 21 filas

    //     // Dibujar la celda combinada para "SELLO"
    page.drawRectangle({
      x: margin,
      y: rowTotalDiasY - 76,
      width: 3 * cellWidth, // Ancho combinado de las 3 primeras columnas
      height: cellHeight * 7 + 3,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    //     // Texto "SELLO DEL LUGAR VISITADO "
    page.drawText(totalDiasText, {
      x: margin + cellWidth - 4, // Centrado
      y: rowTotalDiasY - 20, // Centrado verticalmente
      size: sizeMinimun,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    page.drawRectangle({
      x: margin + 3 * cellWidth + 3,
      y: rowTotalDiasY + 17.5,
      width: 1 * cellWidth - 9, // Ancho combinado de las columnas 5, 6 y 7
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    //      `Fecha de Salida:`;

    page.drawText(fechaTitulo, {
      x: margin + 3 * cellWidth + 8,
      y: rowTotalDiasY + 21.5, // Centrado verticalmente
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    page.drawText(fechaSalida, {
      x: margin + 3 * cellWidth + 75,
      y: rowTotalDiasY + 21.5, // Centrado verticalmente
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    page.drawRectangle({
      x: margin + 3 * cellWidth + 125,
      y: rowTotalDiasY + 17.5,
      width: 65, // Ancho combinado de las columnas 5, 6 y 7
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    //     `Hora Excepción:`;

    page.drawText(horaTitulo, {
      x: margin + 3 * cellWidth + 129,
      y: rowTotalDiasY + 21.5, // Centrado verticalmente
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
      y: rowTotalDiasY + 21.5, // Centrado verticalmente
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    //     // Fila 1: Solo se dibuja la columna 7
    rowSaldoY = rowTotalDiasY - cellHeight; // Justo debajo de la fila anterior

    page.drawRectangle({
      x: margin + 3 * cellWidth + 3, // Posición de la columna 7
      y: rowSaldoY + 17.5 - 3,
      width: 4 * cellWidth - 3, // Ancho de la celda
      height: cellHeight, // Altura de la celda
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // Texto  columna 7

    page.drawText(saldoDiasText_2, {
      x: margin + 4 * cellWidth + 61, // Espaciado dentro de la celda
      y: rowSaldoY + 19, // Centrado verticalmente
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    //     // Fila 2: Solo se dibuja la columna 7
    rowTotalVacacionY = rowSaldoY - cellHeight; // Justo debajo de la fila anterior

    rectX = margin + 3 * cellWidth + 3; // Posición X
    rectY = rowTotalVacacionY - 46.5; // Posición Y
    rectWidth = 4 * cellWidth - 3; // Ancho del rectángulo
    rectHeight = cellHeight * 4 + 16; // Altura del rectángulo
    lineHeight = 10; // Altura de cada línea de texto
    padding = 5; // Espaciado dentro del rectángulo

    // // Dibujar el rectángulo
    page.drawRectangle({
      x: rectX,
      y: rectY,
      width: rectWidth,
      height: rectHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // // Dividir el texto en líneas
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

    // // Dibujar las líneas de texto
    currentY = rectY + rectHeight - lineHeight - padding; // Coordenada Y inicial
    textLines.forEach((line) => {
      if (currentY > rectY + padding) {
        page.drawText(line, {
          x: rectX + padding,
          y: currentY,
          size: sizeNormal,
          font: verdanaFont,
          color: rgb(0, 0, 0),
        });
        currentY -= lineHeight; // Moverse a la siguiente línea
      }
    });

    //     /************* FILA "DETALLE DE PERSONAL DE REEMPLAZO"******** */
    detalleReemplazoRowY = rowTotalVacacionY - 20; // Debajo de la tabla
    //     // Ancho total de la fila  (suma de todas las columnas)
    detalleRowWidth = pageWidth - 2 * margin;

    //     /********** 1° FILA "DETALLE DE PERSONAL DE REEMPLAZO"**********/
    rowReemplazoY = detalleReemplazoRowY - cellHeight;

    //     /*********** 2° FILA "DETALLE DE PERSONAL DE REEMPLAZO"*******/

    //     // Definimos la posición Y para la nueva fila
    rowCargoDetalleY = rowReemplazoY - cellHeight; // Debajo de la fila anterior

    //     // Definimos los anchos personalizados para las dos columnas
    columnWidthsCargoDetalle = [
      34, // Ancho para "Cargo que desempeña:"
      pageWidth - 2 * margin - 34, // Ancho restante para el valor de `this.cargo`
    ];

    //     /********** FILA PARA SOLICITANTE Y JEFE ********** */
    rowFirmasY = rowCargoDetalleY - cellHeight;
    //     // Ancho de cada columna (dividido en tres partes iguales)
    firmaColumnWidth = detalleRowWidth / 3;

    // Dibujar la celda para "Solicitante"
    page.drawRectangle({
      x: margin,
      y: rowFirmasY,
      width: firmaColumnWidth,
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    //     // Texto "Solicitante" centrado

    page.drawText(solicitanteText, {
      x: margin + (firmaColumnWidth - solicitanteTextWidth) / 2 + 5, // Centrado horizontalmente
      y: rowFirmasY + (cellHeight - 9) / 2 + 2, // Centrado verticalmente
      size: sizeNormal,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    // Dibujar la celda para "Jefe Inmediato Superior"
    page.drawRectangle({
      x: margin + firmaColumnWidth,
      y: rowFirmasY,
      width: firmaColumnWidth,
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // Texto "Jefe Inmediato Superior" centrado
    page.drawText(jefeText, {
      x:
        margin + firmaColumnWidth + (firmaColumnWidth - jefeTextWidth) / 2 + 10, // Centrado horizontalmente
      y: rowFirmasY + (cellHeight - 9) / 2 + 2, // Centrado verticalmente
      size: sizeNormal,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    // Dibujar la celda para "Dirección Adm. y RRHH"
    page.drawRectangle({
      x: margin + 2 * firmaColumnWidth,
      y: rowFirmasY,
      width: firmaColumnWidth,
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // Texto "Dirección Adm. y RRHH" centrado
    page.drawText(direccionText, {
      x:
        margin +
        2 * firmaColumnWidth +
        (firmaColumnWidth - direccionTextWidth) / 2 +
        10, // Centrado horizontalmente
      y: rowFirmasY + (cellHeight - 9) / 2 + 2, // Centrado verticalmente
      size: sizeNormal,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    // Fila vacía debajo de las tres columnas
    rowNuevaFilaY = rowFirmasY - cellHeight - 70; // Justo debajo de la fila anterior

    // Dibujar la celda vacía para la primera columna
    page.drawRectangle({
      x: margin,
      y: rowNuevaFilaY,
      width: firmaColumnWidth,
      height: cellHeight + 70,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // Dibujar la celda vacía para la segunda columna
    page.drawRectangle({
      x: margin + firmaColumnWidth,
      y: rowNuevaFilaY,
      width: firmaColumnWidth,
      height: cellHeight + 70,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // Dibujar la celda vacía para la tercera columna
    page.drawRectangle({
      x: margin + 2 * firmaColumnWidth,
      y: rowNuevaFilaY,
      width: firmaColumnWidth,
      height: cellHeight + 70,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    page.drawText(note, {
      x: margin + 10, // Alineado a la derecha en la tercera columna
      y: rowNuevaFilaY - 15, // Parte superior de la celda
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    page.drawText(noteContinuos, {
      x: margin + 37, // Alineado a la derecha en la tercera columna
      y: rowNuevaFilaY - 25, // Parte superior de la celda
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    // Guardamos el PDF
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    saveAs(blob, 'solicitud_de_excepcion.pdf');
  }

  async generatePermiso(datosGenerales: any, element: any, contrato: any) {
    // console.log('datosGenerales: ', datosGenerales);
    // console.log('element: ', element);
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

    //datos detalle
    const dias = element.dias.map((dia: any) => {
      const fechaISO = dia.fecha.split('T')[0]; // "2025-04-01"
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

    let cellHeight = 15; // Altura de cada celda (ajustar según necesidad)

    // Registra fontkit
    pdfDoc.registerFontkit(fontkit); // Registra fontkit para usar fuentes personalizadas

    // Cargar la fuente Verdana
    let verdanaBytes = await fetch('/assets/fonts/verdana.ttf').then((res) =>
      res.arrayBuffer()
    );
    let verdanaFont = await pdfDoc.embedFont(verdanaBytes);

    // Cargar la fuente Verdana Bold
    let verdanaBoldBytes = await fetch('/assets/fonts/verdana-bold.ttf').then(
      (res) => res.arrayBuffer()
    );
    let verdanaBoldFont = await pdfDoc.embedFont(verdanaBoldBytes);

    // Crear una página tamaño carta (21.59 cm x 27.94 cm)
    let page = pdfDoc.addPage([595.28, 841.89]); // Tamaño Carta (595.28 x 841.89 puntos)

    let margin = 28.35; // 1 cm = 28.35 puntos
    let pageWidth = page.getWidth();
    let pageHeight = page.getHeight();

    // Definir la altura de la fila y las columnas
    let rowHeight = 45;
    let columnWidth = (pageWidth - 2 * margin) / 3; // Dividido en 3 columnas

    // Dibujar la fila con borde
    page.drawRectangle({
      x: margin,
      y: pageHeight - margin - rowHeight,
      width: pageWidth - 2 * margin,
      height: rowHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
      color: rgb(1, 1, 1), // Fondo blanco
    });

    // Primera columna: Logo
    let logoBytes = await fetch('/assets/img/logo.png').then((res) =>
      res.arrayBuffer()
    );
    let logoImage = await pdfDoc.embedPng(logoBytes);
    let logoDims = logoImage.scale(0.1); // Redimensiona el logo si es necesario
    page.drawImage(logoImage, {
      x: margin + 5,
      y: pageHeight - margin - rowHeight + 5,
      width: logoDims.width,
      height: logoDims.height,
    });

    // Segunda columna: Título  (centrado)
    let titleWidth = verdanaBoldFont.widthOfTextAtSize(titleText, sizeTitle); // Calcula el ancho del texto
    let titleHeight = verdanaBoldFont.heightAtSize(sizeTitle); // Calcula la altura del texto
    // Centrar el texto horizontalmente
    let centerX = margin + (pageWidth - 2 * margin - titleWidth) / 2;

    // Dibujar el texto del título
    page.drawText(titleText, {
      x: centerX, // Posición X centrada
      y: pageHeight - margin - rowHeight + (rowHeight - titleHeight) / 2, // Centrado en el eje Y
      size: sizeTitle,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });
    // Tercera columna: "FOR-RH-001"
    let codeText = 'FOR-RH-001';
    let codeWidth = verdanaFont.widthOfTextAtSize(codeText, 8);
    page.drawText(codeText, {
      x: margin + 2 * columnWidth + columnWidth - codeWidth - 30, // Alineado a la derecha en la tercera columna
      y: pageHeight - margin - 15, // Parte superior de la celda
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    let codeDate = 'FECHA: ' + fechaSolicitud;
    let codeDateWith = verdanaFont.widthOfTextAtSize(codeDate, 8);
    page.drawText(codeDate, {
      x: margin + 2 * columnWidth + columnWidth - codeDateWith, // Alineado a la derecha en la tercera columna
      y: pageHeight - margin - 35, // Parte superior de la celda
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    /******** DATOS GENERALES ENCABEZADO **********/
    let datosGeneralesRowY = pageHeight - margin - rowHeight - 14.7;
    let datosGeneralesRowWidth = pageWidth - 2 * margin;

    page.drawRectangle({
      x: margin,
      y: datosGeneralesRowY,
      width: datosGeneralesRowWidth, // Usamos el mismo ancho total
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    let datosGeneralesText = 'DATOS GENERALES';
    let datosGeneralesTextWidth = verdanaBoldFont.widthOfTextAtSize(
      datosGeneralesText,
      9
    );

    page.drawText(datosGeneralesText, {
      x: margin + (datosGeneralesRowWidth - datosGeneralesTextWidth) / 2,
      y: datosGeneralesRowY + (cellHeight - 9) / 2 + 2,
      size: sizeNormal,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    /********* 1° FILA PARA DATO GENERALES *********/
    // Crear una nueva fila para los datos generales
    let rowDatosGeneralesY = datosGeneralesRowY - cellHeight;

    // Definimos los anchos personalizados para cada columna (en puntos)
    let columnWidths = [
      45, // Nombres
      110, // Valor de Nombres
      46, // Apellidos
      150, // Valor de Apellidos
      25, // C.I.
      64, // Valor de C.I.
      45, // Teléfono
      53.5, // Valor de Teléfono
    ];

    // Función para dibujar una celda con texto
    let drawCellWithText = (
      label: string,
      xPos: number,
      yPos: number,
      cellWidth: number
    ) => {
      // Dibujar la celda con borde
      page.drawRectangle({
        x: xPos,
        y: yPos,
        width: cellWidth,
        height: cellHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });

      // Dibujar el texto centrado verticalmente
      page.drawText(label, {
        x: xPos + 5, // Margen interno
        y: yPos + (cellHeight - sizeNormal) / 2,
        size: sizeNormal,
        font: verdanaFont,
        color: rgb(0, 0, 0),
      });
    };

    // Posición X inicial
    let xPos = margin;

    // Dibujar las 8 columnas con sus respectivos anchos personalizados
    drawCellWithText('Nombres:', xPos, rowDatosGeneralesY, columnWidths[0]);
    xPos += columnWidths[0]; // Avanzar a la siguiente posición de celda

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

    /****************** 2° FILA PARA DATOS GENERALES ***************/

    // Definimos la posición Y para la nueva fila
    let rowCargoY = rowDatosGeneralesY - cellHeight; // Debajo de la fila anterior

    // Definimos los anchos personalizados para las dos columnas
    let columnWidthsCargo = [
      34, // Ancho para "Cargo que desempeña:"
      pageWidth - 2 * margin - 34, // Ancho restante para el valor de `this.cargo`
    ];

    // Dibujar la primera columna: "Cargo que desempeña:"
    page.drawRectangle({
      x: margin,
      y: rowCargoY,
      width: columnWidthsCargo[0],
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    page.drawText('Cargo:', {
      x: margin + 5, // Margen interno
      y: rowCargoY + (cellHeight - sizeNormal) / 2, // Centrado verticalmente
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    // Dibujar la segunda columna: valor de `this.cargo`
    page.drawRectangle({
      x: margin + columnWidthsCargo[0],
      y: rowCargoY,
      width: columnWidthsCargo[1],
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    page.drawText(this.truncateText(cargo, 139), {
      x: margin + columnWidthsCargo[0] + 5, // Margen interno en la segunda columna
      y: rowCargoY + (cellHeight - sizeNormal) / 2, // Centrado verticalmente
      size: sizeMinimun,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    /****************** 3° FILA PARA DATOS GENERALES ***************/
    // Definimos la posición Y para la nueva fila
    let rowRegistroY = rowCargoY - cellHeight; // Justo debajo de la fila de "Cargo"

    // Definimos los anchos personalizados para las seis columnas
    let columnWidthsRegistro = [
      55, // Ancho para "N° Item:"
      33, // Ancho para `this.registro`
      35, // Ancho para "Unidad:"
      310, // Ancho para `this.unidad`
      58, // Ancho para "Dependencia:"
      pageWidth - 2 * margin - 491, // Ancho restante para `this.dependencia`
    ];

    // Dibujar la primera columna: "N° Item:"
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

    // Dibujar la segunda columna: `this.registro`
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

    // Dibujar la tercera columna: "Unidad:"
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

    // Dibujar la cuarta columna: `this.unidad`
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

    // Dibujar la quinta columna: "Dependencia:"
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

    // Dibujar la sexta columna: `this.dependencia`
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

    /****************** FILA PARA DETALLE******************** */

    let detalleRowY = rowDatosGeneralesY - 45; // Debajo de la tabla
    // Ancho total de la fila  (suma de todas las columnas)
    let detalleRowXWidth = pageWidth - 2 * margin;

    // Dibujar la celda de "DETALLE"
    page.drawRectangle({
      x: margin,
      y: detalleRowY,
      width: detalleRowXWidth, // Usamos el mismo ancho total
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // Texto "DETALLE" centrado
    let detalleText = 'DETALLE';
    let detalleTextWidth = verdanaBoldFont.widthOfTextAtSize(detalleText, 9);

    page.drawText(detalleText, {
      x: margin + (detalleRowXWidth - detalleTextWidth) / 2, // Centrado horizontalmente
      y: detalleRowY + (cellHeight - 9) / 2 + 2, // Centrado verticalmente
      size: sizeNormal,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    // Cuarta fila: Encabezado de la tabla (7 columnas)
    let row4Y = detalleRowY - 15; // Debajo de la fila de Cargo y N° registro

    let cellWidth = (pageWidth - 2 * margin) / 7; // Ancho dividido entre 7 columnas

    // Dibujar encabezados de la tabla
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
      // Omitir la columna separadora (índice 3)
      if (index === 3) {
        return; // Salir de esta iteración
      }
      let xPos = margin + index * cellWidth;
      page.drawText(header, {
        x: xPos + 2, // Un poco de margen dentro de la celda
        y: row4Y + cellHeight - 10, // Ajustar para centrar en la celda
        size: sizeMinimun,
        font: verdanaBoldFont,
        color: rgb(0, 0, 0),
      });
      // Dibujar la celda del encabezado
      page.drawRectangle({
        x: xPos,
        y: row4Y,
        width: cellWidth,
        height: cellHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });
    });

    // Dibujar las filas de datos (21 filas en total)
    for (let rowIndex = 0; rowIndex < 20; rowIndex++) {
      let rowY = row4Y - (rowIndex + 1) * cellHeight;

      for (let colIndex = 0; colIndex < 7; colIndex++) {
        let xPos = margin + colIndex * cellWidth;

        // Columna separadora (colIndex 3) se mantiene vacía
        if (colIndex === 3) {
          //   page.drawRectangle({
          //     x: xPos,
          //     y: rowY,
          //     width: cellWidth,
          //     height: cellHeight,
          //     borderColor: rgb(0, 0, 0),
          //     borderWidth: 1,
          //   });
          continue;
        }

        // Calcular el índice del elemento en `dias` para esta celda
        let dataIndex = rowIndex + (colIndex < 4 ? 0 : 20); // Cambia a segunda mitad después de la fila 21

        // Obtener el dato correspondiente
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

        // Dibujar el texto
        page.drawText(text || '', {
          x: xPos + 2,
          y: rowY + cellHeight - 10,
          size: sizeMinimun,
          font: verdanaFont,
          color: rgb(0, 0, 0),
        });

        // Dibujar la celda
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

    // Nueva fila para "TOTAL DÍAS SOLICITADOS" y "Saldo Días Vacación al:"
    let rowTotalDiasY = row4Y - 21 * cellHeight - 5; // Debajo de las 21 filas

    // Dibujar la celda combinada para "TOTAL DÍAS SOLICITADOS:"
    page.drawRectangle({
      x: margin,
      y: rowTotalDiasY,
      width: 3 * cellWidth, // Ancho combinado de las 3 primeras columnas
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // Texto "TOTAL DÍAS SOLICITADOS:"
    let totalDiasText = `TOTAL DÍAS SOLICITADOS: `;
    let totalDiasTextWidth = verdanaBoldFont.widthOfTextAtSize(
      totalDiasText,
      7
    );
    page.drawText(totalDiasText, {
      x: margin + (3 * cellWidth - totalDiasTextWidth) / 2 - 10, // Centrado
      y: rowTotalDiasY + (cellHeight - 6) / 2, // Centrado verticalmente
      size: sizeNormal,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });
    // Texto del valor de `total_dias`
    let totalDiasValue = `${dias_solicitados}`;
    page.drawText(totalDiasValue, {
      x: margin + 3 * cellWidth - totalDiasTextWidth + 40, // Alineado con separación
      y: rowTotalDiasY + (cellHeight - 6) / 2,
      size: sizeNormal,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });
    /********************************************************************************** */

    // let detalleRowY = rowDatosGeneralesY - 45; // Debajo de la tabla
    // // Ancho total de la fila  (suma de todas las columnas)
    // let detalleRowXWidth = pageWidth - 2 * margin;

    // // Dibujar la celda de "DETALLE"
    // page.drawRectangle({
    //   x: margin,
    //   y: detalleRowY,
    //   width: detalleRowXWidth, // Usamos el mismo ancho total
    //   height: cellHeight,
    //   borderColor: rgb(0, 0, 0),
    //   borderWidth: 1,
    // });

    // // Texto "DETALLE" centrado
    // let detalleText = 'SALIDA';
    // let detalleTextWidth = verdanaBoldFont.widthOfTextAtSize(detalleText, 9);

    // page.drawText(detalleText, {
    //   x: margin + (detalleRowXWidth - detalleTextWidth) / 2, // Centrado horizontalmente
    //   y: detalleRowY + (cellHeight - 9) / 2 + 2, // Centrado verticalmente
    //   size: sizeNormal,
    //   font: verdanaBoldFont,
    //   color: rgb(0, 0, 0),
    // });

    // // Cuarta fila: Encabezado de la tabla (7 columnas)
    // let row4Y = detalleRowY - 15; // Debajo de la fila de Cargo y N° registro

    // let cellWidth = (pageWidth - 2 * margin) / 7; // Ancho dividido entre 7 columnas

    // // Nueva fila para "TOTAL DÍAS SOLICITADOS" y "Saldo Días Vacación al:"
    // let rowTotalDiasY = row4Y - 21; // Debajo de las 21 filas

    // // Dibujar la celda combinada para "SELLO"
    // page.drawRectangle({
    //   x: margin,
    //   y: rowTotalDiasY - 76,
    //   width: 3 * cellWidth, // Ancho combinado de las 3 primeras columnas
    //   height: cellHeight * 7 + 3,
    //   borderColor: rgb(0, 0, 0),
    //   borderWidth: 1,
    // });

    // // Texto "SELLO DEL LUGAR VISITADO "
    // let totalDiasText = `SELLO DEL LUGAR VISITADO`;
    // let totalDiasTextWidth = verdanaFont.widthOfTextAtSize(totalDiasText, 7);
    // page.drawText(totalDiasText, {
    //   x: margin + cellWidth - 4, // Centrado
    //   y: rowTotalDiasY - 20, // Centrado verticalmente
    //   size: sizeMinimun,
    //   font: verdanaFont,
    //   color: rgb(0, 0, 0),
    // });

    // Fila 1: Solo se dibuja la columna 7
    let rowSaldoY = rowTotalDiasY - cellHeight - 19; // Justo debajo de la fila anterior
    let xMotivo = margin;
    let withMotivo = 7 * cellWidth - 3;
    page.drawRectangle({
      x: xMotivo, // Posición de la columna 7
      y: rowSaldoY + 17.5 - 3,
      width: withMotivo, // Ancho de la celda
      height: cellHeight, // Altura de la celda
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // Texto "Saldo Días Vacación al:" en la columna 7
    let saldoDiasText_2 = `Motivo`;

    page.drawText(saldoDiasText_2, {
      x: margin + 3 * cellWidth + 30, // Espaciado dentro de la celda
      y: rowSaldoY + 19, // Centrado verticalmente
      size: sizeNormal,
      font: verdanaFont,
      color: rgb(0, 0, 0),
    });

    // Fila 2: Solo se dibuja la columna 7
    let rowTotalVacacionY = rowSaldoY - cellHeight; // Justo debajo de la fila anterior

    // Parámetros del rectángulo
    let rectX = xMotivo; // Posición X
    let rectY = rowTotalVacacionY - 46.5; // Posición Y
    let rectWidth = withMotivo; // Ancho del rectángulo
    let rectHeight = cellHeight * 4 + 16; // Altura del rectángulo
    let lineHeight = 10; // Altura de cada línea de texto
    let padding = 5; // Espaciado dentro del rectángulo

    // Dibujar el rectángulo
    page.drawRectangle({
      x: rectX,
      y: rectY,
      width: rectWidth,
      height: rectHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // Dividir el texto en líneas
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

    // Dibujar las líneas de texto
    let currentY = rectY + rectHeight - lineHeight - padding; // Coordenada Y inicial
    textLines.forEach((line) => {
      if (currentY > rectY + padding) {
        page.drawText(line, {
          x: rectX + padding,
          y: currentY,
          size: sizeNormal,
          font: verdanaFont,
          color: rgb(0, 0, 0),
        });
        currentY -= lineHeight; // Moverse a la siguiente línea
      }
    });

    /************* FILA "DETALLE DE PERSONAL DE REEMPLAZO"******** */
    let detalleReemplazoRowY = rowTotalVacacionY - 22; // Debajo de la tabla
    // Ancho total de la fila  (suma de todas las columnas)
    let detalleRowWidth = pageWidth - 2 * margin;

    /********** 1° FILA "DETALLE DE PERSONAL DE REEMPLAZO"**********/
    let rowReemplazoY = detalleReemplazoRowY - cellHeight;

    /*********** 2° FILA "DETALLE DE PERSONAL DE REEMPLAZO"*******/

    // Definimos la posición Y para la nueva fila
    let rowCargoDetalleY = rowReemplazoY - cellHeight; // Debajo de la fila anterior

    // Definimos los anchos personalizados para las dos columnas
    let columnWidthsCargoDetalle = [
      34, // Ancho para "Cargo que desempeña:"
      pageWidth - 2 * margin - 34, // Ancho restante para el valor de `this.cargo`
    ];

    /********** FILA PARA SOLICITANTE Y JEFE ********** */
    let rowFirmasY = rowCargoDetalleY - cellHeight;
    // Ancho de cada columna (dividido en tres partes iguales)
    let firmaColumnWidth = detalleRowWidth / 3;

    // Dibujar la celda para "Solicitante"
    page.drawRectangle({
      x: margin,
      y: rowFirmasY,
      width: firmaColumnWidth,
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // Texto "Solicitante" centrado
    let solicitanteText = 'Solicitante';
    let solicitanteTextWidth = verdanaBoldFont.widthOfTextAtSize(
      solicitanteText,
      9
    );
    page.drawText(solicitanteText, {
      x: margin + (firmaColumnWidth - solicitanteTextWidth) / 2 + 5, // Centrado horizontalmente
      y: rowFirmasY + (cellHeight - 9) / 2 + 2, // Centrado verticalmente
      size: sizeNormal,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    // Dibujar la celda para "Jefe Inmediato Superior"
    page.drawRectangle({
      x: margin + firmaColumnWidth,
      y: rowFirmasY,
      width: firmaColumnWidth,
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // Texto "Jefe Inmediato Superior" centrado
    let jefeText = 'Inmediato Superior';
    let jefeTextWidth = verdanaBoldFont.widthOfTextAtSize(jefeText, 9);
    page.drawText(jefeText, {
      x:
        margin + firmaColumnWidth + (firmaColumnWidth - jefeTextWidth) / 2 + 10, // Centrado horizontalmente
      y: rowFirmasY + (cellHeight - 9) / 2 + 2, // Centrado verticalmente
      size: sizeNormal,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    // Dibujar la celda para "Dirección Adm. y RRHH"
    page.drawRectangle({
      x: margin + 2 * firmaColumnWidth,
      y: rowFirmasY,
      width: firmaColumnWidth,
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // Texto "Dirección Adm. y RRHH" centrado
    let direccionText = 'Dirección Adm. y RRHH';
    let direccionTextWidth = verdanaBoldFont.widthOfTextAtSize(
      direccionText,
      9
    );
    page.drawText(direccionText, {
      x:
        margin +
        2 * firmaColumnWidth +
        (firmaColumnWidth - direccionTextWidth) / 2 +
        10, // Centrado horizontalmente
      y: rowFirmasY + (cellHeight - 9) / 2 + 2, // Centrado verticalmente
      size: sizeNormal,
      font: verdanaBoldFont,
      color: rgb(0, 0, 0),
    });

    // Fila vacía debajo de las tres columnas
    let rowNuevaFilaY = rowFirmasY - cellHeight - 70; // Justo debajo de la fila anterior

    // Dibujar la celda vacía para la primera columna
    page.drawRectangle({
      x: margin,
      y: rowNuevaFilaY,
      width: firmaColumnWidth,
      height: cellHeight + 70,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // Dibujar la celda vacía para la segunda columna
    page.drawRectangle({
      x: margin + firmaColumnWidth,
      y: rowNuevaFilaY,
      width: firmaColumnWidth,
      height: cellHeight + 70,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // Dibujar la celda vacía para la tercera columna
    page.drawRectangle({
      x: margin + 2 * firmaColumnWidth,
      y: rowNuevaFilaY,
      width: firmaColumnWidth,
      height: cellHeight + 70,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // Guardamos el PDF
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
    const mes = (fechaConvertida.getUTCMonth() + 1).toString().padStart(2, '0'); // Los meses comienzan desde 0
    const anio = fechaConvertida.getUTCFullYear();

    return `${dia}/${mes}/${anio}`;
  }
}
