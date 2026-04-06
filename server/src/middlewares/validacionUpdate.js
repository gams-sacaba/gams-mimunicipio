const {
  validarUsuario,
  validarFuncionario,
  validarDetalle,
  validarSolicitud,
  validarContenido,
  validarBandeja,
  validarUnidad,
  validarDependencia,
  validarSettings,
} = require("./validacionCreate");

//requerido envia el valor de false con el objetivo de que los campos pasen a un valor no required y sean opcional, pero que a su vez no permita introducir campos null.
//actualizar habilita la funcion de actualizar y realizar las busquedas de los campos establecidos omitiendo su busqueda en si mismo, es decir, el valor del id a actualizar no sera verificado.

const requerido = false;
const actualizar = true;

function validarActualizacionUsuario() {
  return validarUsuario(requerido, actualizar);
}

function validarActualizacionFuncionario() {
  return validarFuncionario(requerido, actualizar);
}

function validarActualizacionDetalle() {
  return validarDetalle(requerido, actualizar);
}

function validarActualizacionSolicitud() {
  return validarSolicitud(requerido, actualizar);
}

function validarActualizacionContenido() {
  return validarContenido(requerido, actualizar);
}

function validarActualizacionBandeja() {
  return validarBandeja(requerido, actualizar);
}

function validarActualizacionUnidad() {
  return validarUnidad(requerido, actualizar);
}

function validarActualizacionDependencia() {
  return validarDependencia(requerido, actualizar);
}

function validarActualizacionSettings() {
  return validarSettings(requerido, actualizar);
}

module.exports = {
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
