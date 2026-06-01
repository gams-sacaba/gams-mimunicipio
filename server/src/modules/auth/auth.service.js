import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../funcionarios/funcionarios.model.js";
import Registro from "../registros/registros.model.js";
import Rotaciones from "../rotaciones/rotaciones.model.js";
import {
  obtenerAprobadorInmediato,
  isCargoAprobador,
} from "../../shared/helpers/aprobadores.helpers.js";

const secretKey = process.env.JWT_SECRET;

class AuthService {
  async login(username, password, roleRequested) {
    const [ci, ext] = username.split("-");
    const query = ext ? { ci, ext } : { ci };
    const user = await User.findOne(query);

    if (!user) throw new Error("USUARIO_NO_ENCONTRADO");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("PASSWORD_INCORRECTO");

    const userRegistro = await Registro.findOne({
      id_funcionario: user._id,
      estado: true,
    });
    if (!userRegistro) throw new Error("SIN_REGISTRO_ACTIVO");

    const rotacionActiva = await Rotaciones.findOne({
      id_registro: userRegistro._id,
      estado: true,
    });
    const esRotando = !!rotacionActiva;

    const roleData = user.role.find((r) => r.acceso === roleRequested);
    if (!roleData || !user.estado) throw new Error("NO_AUTORIZADO");

    const cargoABuscar = esRotando
      ? {
          id_cargo_superior: rotacionActiva.id_cargo_rotacion,
          rotando: esRotando,
        }
      : userRegistro.id_cargo;

    const [aprobador, isAprobador] = await Promise.all([
      obtenerAprobadorInmediato(cargoABuscar),
      isCargoAprobador(userRegistro.id_cargo),
    ]);

    const modulesResponse = {
      solicitudes: [],
      datos: [],
      ...(isAprobador !== null ? { bandeja: [] } : {}),
    };

    const tokenPayload = {
      _id: user._id,
      registro: userRegistro._id,
      aprobador: aprobador || null,
      isAprobador: isAprobador || null,
      role: roleData.nivel,
      modules: user.modules || [],
      tokenVersion: user.tokenVersion || 0,
    };

    const token = jwt.sign(tokenPayload, secretKey);

    return {
      success: true,
      token,
      registro: userRegistro._id,
      funcionario: user._id,
      aprobador: aprobador || null,
      isAprobador: isAprobador || null,
      role: roleData.nivel,
      modules: modulesResponse,
      name: user.nombre,
      status: user.estado,
    };
  }

  async updatePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return { success: false, message: "Contraseña actual incorrecta" };

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    return { success: true, message: "Contraseña actualizada con éxito!" };
  }

  async resetPassword(userId) {
    const user = await User.findById(userId);
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(String(user.ci), salt);
    await user.save();
    return { success: true, message: "Contraseña reestablecida con éxito!" };
  }

  async invalidateUserToken(userId) {
    const user = await User.findById(userId);
    if (!user) throw new Error("Usuario no encontrado");

    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    return user;
  }
}

export default new AuthService();
