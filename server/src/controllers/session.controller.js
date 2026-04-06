//session.controller.js
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/funcionarios.model");
const Registro = require("../models/registros.model");
const Rotaciones = require("../models/rotaciones.model");
const { forceLogoutUser } = require("../config/sockets");
const {
  obtenerAprobadorInmediato,
  isCargoAprobador,
} = require("../helpers/aprobadores");

const secretKey = process.env.JWT_SECRET;

async function getElemento(req, res) {}

async function getElementos(req, res) {}

async function createElemento(req, res) {
  const { username, password, role } = req.body;
  //console.log(req.body);
  try {
    // Supongamos que el username tiene el formato "ci-ext"
    const [ci, ext] = username.split("-");

    // Si ext no está presente en el username, usa null o maneja el caso
    const query = ext ? { ci: ci, ext: ext } : { ci: ci };
    //console.log("query: ", query);

    const user = await User.findOne(query);
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(200).json({
        success: false,
        message: "Contraseña actual incorrecta",
      });
    }

    const userRegistro = await Registro.findOne({
      id_funcionario: user._id,
      estado: true,
    });
    //console.log(userRegistro);

    if (!userRegistro) {
      return res
        .status(404)
        .json({ success: false, message: "No se encontró registro activo" });
    }

    const rotacionActiva = await Rotaciones.findOne({
      id_registro: userRegistro._id,
      estado: true,
    });

    const rotando = rotacionActiva ? true : false;

    if (
      userRegistro &&
      user.estado === true &&
      user.role &&
      user.role.length > 0 &&
      user.role.some((r) => r.acceso === role)
    ) {
      const verificarAprobador = rotando
        ? { id_cargo_superior: rotacionActiva.id_cargo_rotacion }
        : userRegistro.id_cargo;
      // Obtener el aprobador inmediato
      const aprobador = await obtenerAprobadorInmediato(verificarAprobador);
      console.log("aprobador: ", aprobador);
      //console.log("aprobador: ");
      const isAprobador = await isCargoAprobador(userRegistro.id_cargo);

      const modules = {
        solicitudes: [],
        datos: [],
        ...(isAprobador !== null ? { bandeja: [] } : {}),
      };

      // Generar el token JWT
      const tokenPayload = {
        _id: user._id,
        registro: userRegistro._id,
        aprobador: aprobador || null,
        isAprobador: isAprobador || null,
        role: user.role[user.role.findIndex((r) => r.acceso === role)].nivel,
        modules: user.modules || [],
        tokenVersion: user.tokenVersion || 0,
      };
      const token = jwt.sign(
        tokenPayload,
        secretKey,
        //{ expiresIn: "1h" } // El token expirará en 1 hora
      );

      if (token && user.estado === true) {
        // const module =
        //   user.role.find((r) => r.acceso === role)?.toObject()?.modules || {};
        const result = {
          success: true,
          token,
          registro: userRegistro._id,
          funcionario: user._id,
          aprobador: aprobador || null,
          isAprobador: isAprobador || null,
          role: user.role[user.role.findIndex((r) => r.acceso === role)].nivel,
          //   modules: module instanceof Map ? Object.fromEntries(module) : module,
          modules: modules || [],
          name: user.nombre,
          status: user.estado,
        };
        res.json(result);
      } else {
        return res
          .status(200)
          .json({ success: false, message: "Error de autorizacion" });
      }
    } else {
      return res
        .status(200)
        .json({ success: false, message: "Usuario no autorizado" });
    }
  } catch (error) {
    return res.status(200).json({
      success: false,
      message: "Usuario no encontrado",
    });
  }
}
async function updateElemento(req, res) {
  const { id, currentPassword, newPassword, role, options } = req.body;
  //console.log(req.body);
  //resetGlobalTokens(req, res);
  try {
    const user = await User.findOne({ _id: id });
    //Actualizar contraseña
    if (options === 1) {
      const passwordMatch = await bcrypt.compare(
        currentPassword,
        user.password,
      );
      if (!passwordMatch) {
        return res
          .status(200)
          .json({ success: false, message: "Contraseña actual incorrecta" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Contraseña actualizada con éxito!",
      });
    } else if (options === 2) {
      //Reestablecer contraseña
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(String(user.ci), salt);
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Contraseña actualizada con éxito!",
      });
    } else if (options === 3) {
      // Actualizar rol
      if (!role) {
        return res.status(200).json({
          success: false,
          message: "El campo role es requerido",
        });
      }

      user.role = role;
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Rol actualizado con éxito!",
      });
    }
    return res.status(200).json({
      success: false,
      message: "Opción no válida",
    });
  } catch (error) {
    return res.status(200).json({
      success: false,
      message: "Usuario no encontrado",
    });
  }
}

async function deleteElemento(req, res) {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) return res.status(404).send("Usuario no encontrado");

  //user.estado = false;
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  await user.save();

  // Forzar logout inmediato
  //forceLogoutUser(global.io, user._id, "estado_false");
  // Forzar logout inmediato de todos los sockets activos del usuario
  forceLogoutUser(global.io, user._id, "token_invalidated");

  res.json({ success: true, message: "Token invalidado" });
}

async function getCampoFiltrado(req, res) {}

async function getElementoFiltrado(req, res) {}

async function resetGlobalTokens(req, res) {
  try {
    const usuarios = await User.find({ estado: true });

    // Actualizamos masivamente en la BD
    const updateResult = await User.updateMany(
      { estado: true },
      { $inc: { tokenVersion: 1 } },
    );

    // función actual en un bucle para cerrar las sesiones
    usuarios.forEach((user) => {
      if (global.io) {
        forceLogoutUser(global.io, user._id, "token_invalidated");
      }
    });

    console.log(
      `Reset masivo completado. ${updateResult.modifiedCount} usuarios desconectados.`,
    );

    res.json({
      success: true,
      message: "Cierre de sesión masivo ejecutado correctamente",
      total: updateResult.modifiedCount,
    });
  } catch (error) {
    console.error("Error en reset masivo:", error);
    res
      .status(500)
      .json({ success: false, message: "Error al procesar el cierre masivo" });
  }
}

module.exports = {
  getElementos,
  getElemento,
  createElemento,
  updateElemento,
  deleteElemento,
  getElementoFiltrado,
  getCampoFiltrado,
};
