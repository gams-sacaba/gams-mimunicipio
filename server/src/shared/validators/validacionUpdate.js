import {
  validarUsuario,
  validarFuncionario,
  validarDetalle,
  validarSolicitud,
  validarContenido,
  validarBandeja,
  validarUnidad,
  validarDependencia,
  validarSettings,
} from "./validacionCreate.js";

const requerido = false;
const actualizar = true;

export function validarActualizacionUsuario() {
  return validarUsuario(requerido, actualizar);
}

export function validarActualizacionFuncionario() {
  return validarFuncionario(requerido, actualizar);
}

export function validarActualizacionDetalle() {
  return validarDetalle(requerido, actualizar);
}

export function validarActualizacionSolicitud() {
  return validarSolicitud(requerido, actualizar);
}

export function validarActualizacionContenido() {
  return validarContenido(requerido, actualizar);
}

export function validarActualizacionBandeja() {
  return validarBandeja(requerido, actualizar);
}

export function validarActualizacionUnidad() {
  return validarUnidad(requerido, actualizar);
}

export function validarActualizacionDependencia() {
  return validarDependencia(requerido, actualizar);
}

export function validarActualizacionSettings() {
  return validarSettings(requerido, actualizar);
}

export default {
  validarActualizacionUsuario,
  validarActualizacionFuncionario,
  validarActualizacionSolicitud,
  validarActualizacionContenido,
  validarActualizacionDetalle,
  validarActualizacionBandeja,
  validarActualizacionUnidad,
  validarActualizacionDependencia,
  validarActualizacionSettings,
};
