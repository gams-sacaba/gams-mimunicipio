import Solicitud from "./solicitudes.model.js";

class SolicitudService {
  async getSolicitudById(id) {
    const sol = await Solicitud.findById(id)
      .populate({
        path: "id_registro",
        populate: [
          { path: "id_cargo", select: "nombre contrato" },
          {
            path: "id_funcionario",
            select: "nombre paterno materno casada ci",
          },
        ],
      })
      .populate("id_contenido")
      .populate("id_cargo_aprobador", "nombre")
      .populate({
        path: "historial_aprobacion.id_registro",
        select: "id_funcionario id_cargo",
        populate: [
          { path: "id_funcionario", select: "nombre paterno materno casada" },
          { path: "id_cargo", select: "nombre" },
        ],
      })
      .sort({ _id: -1 })
      .lean();

    if (!sol) return null;

    return {
      ...sol,
      nombre_cargo_pendiente:
        sol.id_cargo_aprobador?.nombre || "Siguiente Nivel",

      id_cargo_aprobador: sol.id_cargo_aprobador?._id || sol.id_cargo_aprobador,
    };
  }

  async processUpdateByAprobador(id, data) {
    const { estado, observacion, nuevo_historial } = data;
    const updateQuery = { $set: { estado, observacion } };

    if (nuevo_historial) {
      updateQuery.$push = { historial_aprobacion: nuevo_historial };
    }

    await Solicitud.findByIdAndUpdate(id, updateQuery);
    return await this.getSolicitudById(id);
  }

  async getFuncionarioBandeja(objectId) {
    let solicitudes = await Solicitud.find({ id_registro: objectId })
      .populate("id_contenido")
      .populate({ path: "id_cargo_aprobador", select: "nombre" })
      .populate({
        path: "historial_aprobacion.id_registro",
        select: "id_funcionario id_cargo",
        populate: [
          { path: "id_funcionario", select: "nombre paterno materno casada" },
          { path: "id_cargo", select: "nombre" },
        ],
      })
      .sort({ _id: -1 })
      .lean();

    return solicitudes.map((sol) => ({
      ...sol,
      nombre_cargo_pendiente:
        sol.id_cargo_aprobador?.nombre || "Siguiente Nivel",
      id_cargo_aprobador: sol.id_cargo_aprobador?._id || sol.id_cargo_aprobador,
    }));
  }
}

export default new SolicitudService();
