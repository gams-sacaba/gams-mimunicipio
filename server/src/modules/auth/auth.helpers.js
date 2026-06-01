import userService from "../funcionarios/funcionarios.service.js";
import { forceLogoutUser } from "../../core/config/sockets.config.js";

export async function executeReset(id, reason = "token_invalidated") {
  const { usuariosAfectados } = await userService.invalidateTokens(id);
  if (global.io && usuariosAfectados?.length > 0) {
    usuariosAfectados.forEach((u) => forceLogoutUser(global.io, u._id, reason));
  }
  return usuariosAfectados;
}

export default {
  executeReset,
};
