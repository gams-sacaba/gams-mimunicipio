const settingsService = require("../services/settings.service");
const Cargo = require("../models/cargos.model");
const Registro = require("../models/registros.model");
const id_recursos_humanos = "695808c0a886da9f714a6945";

/**
 * Busca recursivamente el cargo aprobador superior más cercano.
 * @param {ObjectId} idCargo - ID del cargo actual del solicitante.
 * @returns {Object|null} El registro (con funcionario) del aprobador o null si no hay.
 */

async function obtenerAprobador(idCargo) {
  try {
    const registroAprobador = await Registro.findOne({
      id_cargo: idCargo,
      estado: true,
    });

    if (!registroAprobador) {
      return null;
    }

    return registroAprobador?.id_funcionario || null;
  } catch (error) {
    console.error("Error obteniendo funcionario aprobador:", error);
    return null;
  }
}

async function obtenerAprobadorInmediato(idCargo) {
  let cargoActual;

  if (typeof idCargo === "object" && idCargo.id_cargo_superior) {
    cargoActual = { id_cargo_superior: idCargo.id_cargo_superior };
  } else {
    cargoActual = await Cargo.findById(idCargo);
  }

  if (!cargoActual || !cargoActual.id_cargo_superior) {
    const redirecciones = settingsService.getRedirecciones();
    const redireccionEncontrada = redirecciones.find(
      (r) =>
        r.estado !== false &&
        r.id_aprobador_origen.toString() === idCargo.toString(),
    );
    if (redireccionEncontrada) {
      return redireccionEncontrada.id_aprobador_destino;
    } else {
      return id_recursos_humanos;
    }
  }

  const cargoSuperior = await Cargo.findById(cargoActual.id_cargo_superior);

  if (!cargoSuperior) {
    return id_recursos_humanos;
  }

  if (cargoSuperior.aprobador === true) {
    const registroAprobador = await Registro.findOne({
      id_cargo: cargoSuperior._id,
      estado: true,
    });

    if (registroAprobador) {
      return cargoSuperior._id;
    }
  }

  return obtenerAprobadorInmediato(cargoSuperior._id);
}

async function isCargoAprobador(idCargo) {
  try {
    const cargoActual = await Cargo.findById(idCargo).lean();

    if (!cargoActual) {
      return null;
    }

    return cargoActual?.aprobador === true ? cargoActual._id : null;
  } catch (error) {
    console.error("Error verificando si el cargo es aprobador:", error);
    return null;
  }
}

module.exports = {
  obtenerAprobador,
  obtenerAprobadorInmediato,
  isCargoAprobador,
};
