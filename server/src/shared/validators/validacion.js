import { validationResult, body } from "express-validator";
import mongoose from "mongoose";

export function validarSolicitud(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

export function validarCampo(nombreCampo, opciones) {
  const validacion = body(nombreCampo);

  if (opciones.requerido !== undefined) {
    if (opciones.requerido === true) {
      validacion
        .notEmpty()
        .withMessage(`El campo ${nombreCampo} es requerido.`);
    }

    if (opciones.requerido === false) {
      validacion
        .optional()
        .notEmpty()
        .withMessage(`El campo ${nombreCampo} no debe ser valor nulo.`);
    }
  }

  if (opciones.longitudMaxima !== undefined) {
    validacion
      .isLength({ max: opciones.longitudMaxima })
      .withMessage(
        `El ${nombreCampo} no debe exceder los ${opciones.longitudMaxima} caracteres.`,
      );
  }

  if (opciones.longitudMinima !== undefined) {
    validacion
      .isLength({ min: opciones.longitudMinima })
      .withMessage(
        `El ${nombreCampo} debe tener al menos ${opciones.longitudMinima} caracteres.`,
      );
  }

  if (opciones.lista !== undefined) {
    validacion
      .isIn(opciones.lista)
      .withMessage(
        `El ${nombreCampo} debe ser uno de los siguientes valores: ${opciones.lista.join(
          ", ",
        )}.`,
      );
  }

  if (opciones.tipoNumero) {
    validacion.isNumeric().withMessage(`El ${nombreCampo} debe ser un número.`);
  }

  if (opciones.tipoEntero) {
    validacion.custom((value) => {
      if (!Number.isInteger(value)) {
        throw new Error(`El ${nombreCampo} debe ser un número entero.`);
      }
      return true;
    });
  }

  if (opciones.minNumero !== undefined) {
    validacion.custom((value) => {
      if (value === null || value === undefined || value === "") {
        throw new Error(`El ${nombreCampo} es requerido.`);
      }
      const num = parseFloat(value);
      if (isNaN(num) || num < opciones.minNumero) {
        throw new Error(
          `El ${nombreCampo} debe ser un número mayor o igual a ${opciones.minNumero}.`,
        );
      }
      return true;
    });
  }

  if (opciones.formatoFecha) {
    validacion
      .isISO8601()
      .withMessage(
        `El ${nombreCampo} debe tener un formato de fecha ISO8601 válido.`,
      );
  }

  if (opciones.fechaLimite) {
    validacion.custom((value) => {
      if (value) {
        const fechaNacimiento = new Date(value);
        const fechaLimite = new Date("1900-01-01");
        if (fechaNacimiento < fechaLimite) {
          throw new Error(
            "La fecha de nacimiento debe ser posterior al 1 de enero de 1950.",
          );
        }
      }
      return true;
    });
  }

  if (opciones.existeEnBD) {
    validacion.custom(async (value, { req }) => {
      let parameter;
      if (opciones.actualizar) {
        parameter = {
          [nombreCampo]: value,
          _id: { $ne: req.params.id },
        };
      } else {
        parameter = {
          [nombreCampo]: value,
        };
      }
      const registroExistente = await opciones.existeEnBD.findOne(parameter);
      if (registroExistente) {
        throw new Error(`Ya existe un registro con este ${nombreCampo}.`);
      }
      return true;
    });
  }

  if (opciones.existeValues) {
    validacion.custom(async (value, { req }) => {
      let parameter;
      if (opciones.actualizar) {
        parameter = {
          [nombreCampo]: value,
          estado: true,
          _id: { $ne: req.params.id },
        };
      } else {
        parameter = {
          [nombreCampo]: value,
          estado: true,
        };
      }
      const registroExistente = await opciones.existeValues.findOne(parameter);
      if (registroExistente) {
        throw new Error("Ya existe una gestión con este código.");
      }
      return true;
    });
  }

  if (opciones.existeCI) {
    validacion.custom(async (value, { req }) => {
      let parameter;
      if (opciones.actualizar) {
        parameter = req.body.ext
          ? {
              ci: value,
              ext: req.body.ext.toUpperCase(),
              _id: { $ne: req.params.id },
            }
          : {
              $or: [
                {
                  ci: value,
                  ext: { $exists: false },
                  _id: { $ne: req.params.id },
                },
              ],
            };
      } else {
        parameter = req.body.ext
          ? { ci: value, ext: req.body.ext.toUpperCase() }
          : {
              $or: [{ ci: value, ext: { $exists: false } }],
            };
      }

      const registroExistente = await opciones.existeCI.findOne(parameter);
      if (registroExistente) {
        throw new Error("Ya existe un registro con el mismo CI y EXT.");
      }
      return true;
    });
  }

  if (opciones.funcionValidacion) {
    validacion.custom(opciones.funcionValidacion);
  }

  if (opciones.tipoArray) {
    validacion.custom((value, { req }) => {
      if (!Array.isArray(value)) {
        throw new Error(`El campo ${nombreCampo} debe ser un arreglo.`);
      }

      value.forEach((elemento, index) => {
        if (
          !elemento.id_cargo ||
          !mongoose.Types.ObjectId.isValid(elemento.id_cargo)
        ) {
          throw new Error(
            `El campo id_cargo del elemento ${index} del campo ${nombreCampo} es inválido.`,
          );
        }

        if (
          !elemento.tipo ||
          !["ALTA", "BAJA", "ROTACION", "CAMBIO"].includes(
            elemento.tipo.toUpperCase(),
          )
        ) {
          throw new Error(
            `El campo tipo del elemento ${index} del campo ${nombreCampo} debe ser una de las opciones permitidas: ALTA, BAJA, ROTACION, CAMBIO.`,
          );
        }

        if (!elemento.fecha_inicio || isNaN(new Date(elemento.fecha_inicio))) {
          throw new Error(
            `El campo fecha_inicio del elemento ${index} del campo ${nombreCampo} debe ser una fecha válida.`,
          );
        }
      });
      return true;
    });
  }

  if (opciones.tipoBooleano) {
    validacion
      .isBoolean()
      .withMessage(`El ${nombreCampo} debe ser un valor booleano.`);
  }

  if (opciones.tipoMongoId) {
    validacion
      .isMongoId()
      .withMessage(`El ${nombreCampo} debe ser un ID de MongoDB válido.`);
  }

  return validacion;
}

export default {
  validarCampo,
  validarSolicitud,
};
