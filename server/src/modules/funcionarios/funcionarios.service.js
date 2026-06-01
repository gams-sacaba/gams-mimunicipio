import User from "./funcionarios.model.js";
import Registro from "../registros/registros.model.js";
import Rotacion from "../rotaciones/rotaciones.model.js";

class UserService {
  /**
   * @param {String|null} userId
   * @returns {Promise<{usuariosAfectados: Array, total: Number}>}
   */
  async invalidateTokens(userId = null) {
    const filtro = userId ? { _id: userId, estado: true } : { estado: true };

    const [usuariosAfectados, updateResult] = await Promise.all([
      User.find(filtro).select("_id").lean(),
      User.updateMany(filtro, { $inc: { tokenVersion: 1 } }),
    ]);

    return {
      usuariosAfectados,
      total: updateResult.modifiedCount,
    };
  }

  async getFullProfile(funcionarioId) {
    const funcionario = await User.findById(funcionarioId).lean();
    if (!funcionario) return null;

    const registro = await Registro.findOne({
      id_funcionario: funcionarioId,
      estado: true,
    })
      .populate({
        path: "id_cargo",
        populate: [
          { path: "id_nivel_salarial", select: "nombre" },
          { path: "id_dependencia", select: "nombre sigla" },
          { path: "id_unidad", select: "nombre clasificacion" },
          { path: "id_cargo_superior", select: "nombre" },
        ],
      })
      .lean();

    let rotaciones = [];
    if (registro) {
      rotaciones = await Rotacion.find({
        id_registro: registro._id,
        estado: true,
      }).lean();
    }

    return {
      funcionario,
      registro: registro || null,
      rotaciones: rotaciones || [],
    };
  }

  async getUserStatus(userId) {}
}

export default new UserService();
