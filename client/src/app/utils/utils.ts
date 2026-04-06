import { FormGroup, AbstractControl, ValidatorFn } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';

export function ordenPalabras(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function getCurrentISODateTime(): string {
  return new Date().toISOString();
}

export function convertFromISO8601(isoDateString: string): Date {
  const date = new Date(isoDateString);

  if (isNaN(date.getTime())) {
    throw new Error('Formato invalido ISO 8601');
  }

  return date;
}

export function convertirFecha(
  fecha: string | Date,
  timeZone: string = 'America/La_Paz',
): string {
  if (!fecha) {
    return 'Fecha no válida';
  }

  if (typeof fecha === 'string') {
    const datePart = fecha.split('T')[0];
    const [year, month, day] = datePart.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);
    const formatter = new Intl.DateTimeFormat('es-BO', {
      timeZone: timeZone,
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    return formatter.format(localDate);
  }

  return 'Formato de fecha no soportado';
}

export function convertirFechaISO(dateString: string): string {
  const [day, month, year] = dateString.split('/').map(Number);

  const date = new Date(year, month - 1, day);

  if (isNaN(date.getTime())) {
    throw new Error('Invalid date format!');
  }

  const months = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ];

  return `${day} de ${months[month - 1]} de ${year}`;
}

export function convertToTimezone(date: Date): string {
  const timeZone = 'America/La_Paz';
  try {
    const formatter = new Intl.DateTimeFormat('sv-SE', {
      timeZone: timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    const formattedDate = formatter.format(date);

    return new Date(`${formattedDate}T00:00:00.000Z`).toISOString();
  } catch (error) {
    console.error('Error al convertir la zona horaria:', error);

    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    return normalizedDate.toISOString();
  }
}

export function mesNumeralToLiteral(mes: any): string {
  var monthNames = [
    'ENERO',
    'FEBRERO',
    'MARZO',
    'ABRIL',
    'MAYO',
    'JUNIO',
    'JULIO',
    'AGOSTO',
    'SEPTIEMBRE',
    'OCTUBRE',
    'NOVIEMBRE',
    'DICIEMBRE',
  ];
  return monthNames[parseInt(mes) - 1];
}

export function numerosALetras(num: number): string {
  const units = [
    'cero',
    'uno',
    'dos',
    'tres',
    'cuatro',
    'cinco',
    'seis',
    'siete',
    'ocho',
    'nueve',
  ];
  const tens = [
    '',
    '',
    'veinte',
    'treinta',
    'cuarenta',
    'cincuenta',
    'sesenta',
    'setenta',
    'ochenta',
    'noventa',
  ];
  const teens = [
    'diez',
    'once',
    'doce',
    'trece',
    'catorce',
    'quince',
    'dieciséis',
    'diecisiete',
    'dieciocho',
    'diecinueve',
  ];
  const hundreds = [
    '',
    'ciento',
    'doscientos',
    'trescientos',
    'cuatrocientos',
    'quinientos',
    'seiscientos',
    'setecientos',
    'ochocientos',
    'novecientos',
  ];

  if (num === 0) return units[0];

  let words = '';

  if (num >= 1000) {
    let thousands = Math.floor(num / 1000);
    words += (thousands === 1 ? 'mil' : units[thousands] + ' mil') + ' ';
    num %= 1000;
  }

  if (num >= 100) {
    let hundred = Math.floor(num / 100);
    words += hundreds[hundred] + ' ';
    num %= 100;
  }

  if (num >= 20) {
    let ten = Math.floor(num / 10);
    words += tens[ten] + (num % 10 === 0 ? '' : ' y ') + ' ';
    num %= 10;
  } else if (num >= 10) {
    words += teens[num - 10] + ' ';
    num = 0;
  }

  if (num > 0 && num < 10) {
    words += units[num] + ' ';
  }

  return words.trim();
}

export function existsValidator(
  control: AbstractControl,
  field: string,
  data: any,
  entities: any[],
): { [key: string]: any } | null {
  let value = control.value;
  if (!value) {
    return null;
  }
  if (typeof value === 'string') {
    value = value.trim().replace(/\s+/g, ' ').toUpperCase();
  }
  let element = '';
  if (data) {
    element = data._id;
  }
  const exists = entities.some(
    (entity) => entity[field].toString() === value && entity._id !== element,
  );
  return exists ? { [`${field}Exists`]: { value } } : null;
}

export function convertToUpperCase(form: FormGroup, fieldName: string): void {
  if (
    form.value[fieldName] &&
    form.value[fieldName] !== null &&
    form.value[fieldName] !== undefined
  ) {
    (form.value[fieldName] = form.value[fieldName]
      .trim()
      .replace(/\s+/g, ' ')).toUpperCase();
  }
}

export function convertToNumber(form: FormGroup, fieldName: string): void {
  if (
    form.value[fieldName] &&
    form.value[fieldName] !== null &&
    form.value[fieldName] !== undefined
  ) {
    form.value[fieldName] = parseInt(form.value[fieldName]);
  }
}

export function convertToDecimal(form: FormGroup, fieldName: string): void {
  if (
    form.value[fieldName] &&
    form.value[fieldName] !== null &&
    form.value[fieldName] !== undefined
  ) {
    form.value[fieldName] = parseFloat(form.value[fieldName]);
  }
}

export function getColor(contrato: string): string {
  switch (contrato) {
    case 'EVENTUAL':
      return '#5DADE2';
    case 'REMANENTE':
      return '#F5B041';
    case 'ITEM':
      return '#52BE80';
    case 'ENCABEZADO':
      return '#95a5a6';
    default:
      return 'white';
  }
}

export function getColorsColumns(contrato: string): string {
  switch (contrato) {
    case 'EVENTUAL':
      return 'rgb(16, 239, 255)';
    case 'REMANENTE':
      return 'rgb(255, 238, 0)';
    case 'ITEM':
      return 'rgb(51, 218, 0)';
    default:
      return '#fffff';
  }
}

export function getIncialesMayuscula(text: string): string {
  if (!text) return '';

  return text
    .toLowerCase()
    .split(' ')
    .filter((word) => word && word.trim() !== '')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function limpiarObject(obj: any): any {
  const cleanedObj: any = {};
  for (const key in obj) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
      cleanedObj[key] = obj[key];
    }
  }
  return cleanedObj;
}

export function getColors(contrato: string): string {
  const color = getColor(contrato);
  return color;
}

export function formatearMonto(monto: any, digito: any): any {
  const formateador = new Intl.NumberFormat('es-ES', {
    style: 'decimal',

    useGrouping: true,
    minimumFractionDigits: digito,
  });

  return formateador.format(monto);
}

export function compararCampos(
  dataRestoreFuncionario: any,
  dataModifyFuncionario: any,
  identifier: any,
) {
  let camposModificados: any = { _id: identifier };
  let camposOriginales: any = { _id: identifier };

  function compararObjetos(
    objOriginal: any,
    objModificado: any,
    camposModificadosRef: any,
    camposOriginalesRef: any,
  ) {
    for (let key in objModificado) {
      if (objModificado.hasOwnProperty(key)) {
        if (
          typeof objModificado[key] === 'object' &&
          objModificado[key] !== null &&
          !(objModificado[key] instanceof Date)
        ) {
          if (!camposModificadosRef[key]) {
            camposModificadosRef[key] = {};
            camposOriginalesRef[key] = {};
          }
          compararObjetos(
            objOriginal[key] || {},
            objModificado[key],
            camposModificadosRef[key],
            camposOriginalesRef[key],
          );

          if (Object.keys(camposModificadosRef[key]).length === 0) {
            delete camposModificadosRef[key];
            delete camposOriginalesRef[key];
          }
        } else {
          if (
            typeof objModificado[key] === 'string' &&
            typeof objOriginal[key] === 'string'
          ) {
            const esFechaModificada = !isNaN(Date.parse(objModificado[key]));
            const esFechaOriginal = !isNaN(Date.parse(objOriginal[key]));

            if (esFechaModificada || esFechaOriginal) {
              const fechaModificada = esFechaModificada
                ? new Date(objModificado[key]).toISOString()
                : '';
              const fechaOriginal = esFechaOriginal
                ? new Date(objOriginal[key]).toISOString()
                : '';

              if (fechaModificada !== fechaOriginal) {
                camposModificadosRef[key] =
                  fechaModificada || objModificado[key];
                camposOriginalesRef[key] = fechaOriginal || objOriginal[key];
              }
              continue;
            }
          }

          const valorModificado =
            objModificado[key] !== undefined ? objModificado[key] : '';
          const valorOriginal =
            objOriginal[key] !== undefined ? objOriginal[key] : '';

          if (valorModificado !== valorOriginal) {
            camposModificadosRef[key] = valorModificado;
            camposOriginalesRef[key] = valorOriginal;
          }
        }
      }
    }
  }

  compararObjetos(
    dataRestoreFuncionario,
    dataModifyFuncionario,
    camposModificados,
    camposOriginales,
  );

  const keysModificados = Object.keys(camposModificados).filter(
    (key) => key !== '_id',
  );

  if (keysModificados.length === 0) {
    return null;
  }

  return { camposModificados, camposOriginales };
}

export function adjustPageSize(paginator: MatPaginator, dataSource: any) {
  const screenHeight = window.innerHeight;

  if (screenHeight <= 568) {
    paginator.pageSize = 5;
  } else if (screenHeight > 568 && screenHeight <= 618) {
    paginator.pageSize = 6;
  } else if (screenHeight > 618 && screenHeight <= 667) {
    paginator.pageSize = 7;
  } else if (screenHeight > 667 && screenHeight <= 717) {
    paginator.pageSize = 8;
  } else if (screenHeight > 717 && screenHeight <= 767) {
    paginator.pageSize = 9;
  } else if (screenHeight > 767 && screenHeight <= 821) {
    paginator.pageSize = 10;
  } else if (screenHeight > 821 && screenHeight <= 871) {
    paginator.pageSize = 11;
  } else if (screenHeight > 871 && screenHeight <= 921) {
    paginator.pageSize = 12;
  } else if (screenHeight > 921 && screenHeight <= 971) {
    paginator.pageSize = 13;
  } else if (screenHeight > 971 && screenHeight <= 1021) {
    paginator.pageSize = 14;
  } else if (screenHeight > 1021 && screenHeight <= 1071) {
    paginator.pageSize = 15;
  } else if (screenHeight > 1071 && screenHeight <= 1121) {
    paginator.pageSize = 16;
  } else if (screenHeight > 1121 && screenHeight <= 1171) {
    paginator.pageSize = 17;
  } else {
    paginator.pageSize = 18;
  }

  dataSource.paginator = paginator;
}

export function dateRangeValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const formGroup = control as any;
    const start = formGroup.get('fecha_ingreso')?.value;
    const end = formGroup.get('fecha_conclusion')?.value;

    if (start && end && end < start) {
      return { dateRangeInvalid: true };
    }
    return null;
  };
}
