import settingsService from "../../modules/settings/settings.service.js";
import Cargo from "../../modules/cargos/cargos.model.js";
import Registro from "../../modules/registros/registros.model.js";

/**
 * @param {ObjectId} idCargo
 * @returns {Object|null}
 */

export async function obtenerAprobador(idCargo) {
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

export async function obtenerAprobadorInmediato(idCargo) {
  const ID_APROBADOR_FINAL = await settingsService.obtenerIdAprobadorFinal();
  if (!idCargo) return ID_APROBADOR_FINAL;

  let cargoActual;

  if (idCargo.rotando) {
    cargoActual = idCargo;
  } else {
    cargoActual = await Cargo.findById(idCargo).lean();
  }

  if (!cargoActual) return ID_APROBADOR_FINAL;

  const idSuperior = cargoActual?.cargo_principal
    ? cargoActual?._id
    : cargoActual?.id_cargo_superior;

  if (idSuperior) {
    const redirecciones = settingsService.getRedirecciones();
    const redireccionEncontrada = redirecciones.find(
      (r) =>
        r.estado !== false &&
        r.id_aprobador_origen &&
        r.id_aprobador_origen.toString() === idSuperior.toString(),
    );

    if (redireccionEncontrada) {
      return redireccionEncontrada.id_aprobador_destino;
    }
  }

  if (!cargoActual.id_cargo_superior) {
    return ID_APROBADOR_FINAL;
  }

  const cargoSuperior = await Cargo.findById(
    cargoActual.id_cargo_superior,
  ).lean();

  if (!cargoSuperior) {
    return ID_APROBADOR_FINAL;
  }

  if (cargoSuperior.aprobador === true) {
    const registroAprobador = await Registro.findOne({
      id_cargo: cargoSuperior._id,
      estado: true,
    }).lean();

    if (registroAprobador) {
      return cargoSuperior._id;
    }
  }

  return obtenerAprobadorInmediato(cargoSuperior._id);
}

export async function isCargoAprobador(idCargo) {
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
