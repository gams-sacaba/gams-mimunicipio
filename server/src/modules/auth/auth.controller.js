import userService from "../funcionarios/funcionarios.service.js";
import authService from "./auth.service.js";
import { executeReset } from "./auth.helpers.js";
import { forceLogoutUser } from "../../core/config/sockets.config.js";

export async function getElementos(req, res) {}

export async function getElemento(req, res) {}

export async function createElemento(req, res) {}

export async function updateElemento(req, res) {}

export async function deleteElemento(req, res) {
  const { id } = req.params;
  try {
    const result = await userService.invalidateUserToken(id);

    if (global.io) {
      forceLogoutUser(global.io, id, "token_invalidated");
    }

    return res.json({
      success: true,
      message: "Sesión invalidada y usuario desconectado",
    });
  } catch (error) {
    console.error("Error en deleteElemento:", error);
    return res.status(404).json({
      success: false,
      message: error.message || "No se pudo invalidar la sesión",
    });
  }
}

export async function getCampoFiltrado(req, res) {}

export async function getElementoFiltrado(req, res) {}

export async function loginSession(req, res) {
  const { username, password, role } = req.body;
  try {
    const result = await authService.login(username, password, role);

    return res.json(result);
  } catch (error) {
    console.error("Login Error:", error.message);

    const messages = {
      USUARIO_NO_ENCONTRADO: "Usuario no encontrado",
      PASSWORD_INCORRECTO: "Contraseña actual incorrecta",
      SIN_REGISTRO_ACTIVO: "No se encontró registro activo",
      NO_AUTORIZADO: "Usuario no autorizado",
    };

    return res.status(200).json({
      success: false,
      message: messages[error.message] || "Error de sistema",
    });
  }
}

export async function resetPassword(req, res) {
  const { id, currentPassword, newPassword, role, options } = req.body;
  try {
    let result;
    if (options === 1)
      result = await authService.updatePassword(
        id,
        currentPassword,
        newPassword,
      );
    else if (options === 2) result = await authService.resetPassword(id);
    else if (options === 3) {
      await User.findByIdAndUpdate(id, { role });
      result = { success: true, message: "Rol actualizado" };
    }

    if (result?.success && (options === 1 || options === 2)) {
      setTimeout(async () => {
        await executeReset(id, "password_changed");
      }, 2100);
      result.message += " y sesiones cerradas por seguridad.";
    }

    return res.json(result || { success: false, message: "Opción no válida" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
}

export async function resetSession(req, res) {
  try {
    const { id } = req.body;
    if (!id)
      return res.status(400).json({ success: false, message: "ID requerido" });

    await executeReset(id);

    return res.json({ success: true, message: "Sesión invalidada con éxito" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export default {
  getElementos,
  getElemento,
  createElemento,
  updateElemento,
  deleteElemento,
  getCampoFiltrado,
  getElementoFiltrado,
  loginSession,
  resetPassword,
  resetSession,
};
