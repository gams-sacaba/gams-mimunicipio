import Solicitud from "./solicitudes.model.js";

export async function getAprobadorBandeja(objectId) {
  return await Solicitud.find({
    id_cargo_aprobador: objectId,
    estado: "ENVIADO",
  })
    .populate("id_contenido")
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
    .sort({ _id: -1 })
    .lean();
}
