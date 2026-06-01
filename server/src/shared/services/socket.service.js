import Solicitud from "../../modules/solicitudes/solicitudes.model.js";
import solicitudService from "../../modules/solicitudes/solicitudes.service.js";
import {
  notifySolicitudUpdateToUser,
  notifySolicitudUpdatedToApprover,
} from "../../core/config/sockets.config.js";
import { obtenerAprobador } from "../../shared/helpers/aprobadores.helpers.js";

class SocketService {
  async notify(solicitudId, payloadOverride = null) {
    try {
      if (payloadOverride && payloadOverride.deleted) {
        const solPreBorrado = await Solicitud.findById(solicitudId)
          .populate({
            path: "id_registro",
            populate: { path: "id_funcionario" },
          })
          .lean();

        if (solPreBorrado?.id_registro?.id_funcionario) {
          await notifySolicitudUpdate({
            ...payloadOverride,
            id_registro: solPreBorrado.id_registro,
          });
        }
        return;
      }

      const solicitudCompleta =
        await solicitudService.getSolicitudById(solicitudId);
      if (solicitudCompleta) {
        await notifySolicitudUpdate(solicitudCompleta);
      }
    } catch (err) {
      console.error("Error en SocketService.notify:", err);
    }
  }

  async removeAndNotify(solicitudId) {
    const solicitud = await Solicitud.findById(solicitudId).populate({
      path: "id_registro",
      populate: { path: "id_funcionario" },
    });

    if (!solicitud) return null;

    const funcionarioId = solicitud.id_registro?.id_funcionario?._id;

    if (funcionarioId && global.io) {
      const payload = { _id: solicitudId, deleted: true };
      notifySolicitudUpdateToUser(global.io, funcionarioId, payload);
    }

    return solicitud;
  }

  async notifySolicitudUpdate(solicitud) {
    if (
      solicitud &&
      solicitud.id_registro &&
      solicitud.id_registro.id_funcionario
    ) {
      const funcionarioId = solicitud.id_registro.id_funcionario._id;

      if (solicitud.id_contenido?.denominacion === "CU") {
        if (funcionarioId) {
          solicitud.action = "HIDE_CU";
          notifySolicitudUpdateToUser(global.io, funcionarioId, solicitud);
        }
      } else {
        notifySolicitudUpdateToUser(global.io, funcionarioId, solicitud);
      }

      if (solicitud?.id_cargo_aprobador) {
        const aprobadorId = await obtenerAprobador(
          solicitud.id_cargo_aprobador,
        );
        if (aprobadorId) {
          notifySolicitudUpdatedToApprover(
            global.io,
            aprobadorId.toString(),
            solicitud,
          );
        } else {
          console.log(
            "No se encontró aprobador para el cargo:",
            solicitud.id_cargo_aprobador,
          );
        }
      }
    }
  }

  async notifyRecursoUpdate() {
    try {
      if (global.io) {
        global.io.emit("recursoUpdated", {
          message: "Los recursos han sido actualizados por MiAdministrador.",
        });
        console.log("Se emitió evento global: recursoUpdated");
      }
    } catch (error) {
      console.error("Error al emitir actualización de recursos:", error);
    }
  }
}

export default new SocketService();
