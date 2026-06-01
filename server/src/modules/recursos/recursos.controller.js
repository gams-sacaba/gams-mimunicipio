import RecursoService from "./recursos.service.js";
import SocketService from "../../shared/services/socket.service.js";

class RecursoController {
  async obtenerConfiguraciones(req, res) {
    try {
      const configuracion = await RecursoService.obtenerConfiguraciones();
      res.json(configuracion);
    } catch (error) {
      res
        .status(500)
        .json({ message: "ERROR_AL_OBTENER_CONFIGURACION_RECURSOS" });
    }
  }

  async obtenerDisponibles(req, res) {
    try {
      const userId = req.user._id;
      const recursos = await RecursoService.getRecursosParaUsuario(userId);

      res.json(recursos);
    } catch (error) {
      res.status(500).json({ message: "ERROR_AL_OBTENER_RECURSOS" });
    }
  }

  async notificarActualizacion(req, res) {
    try {
      await SocketService.notifyRecursoUpdate();

      res.json({ message: "Notificación de actualización global enviada." });
    } catch (error) {
      console.error("Error al notificar recursos:", error);
      res.status(500).json({ message: "ERROR_AL_NOTIFICAR_ACTUALIZACION" });
    }
  }

  async descargar(req, res) {
    try {
      const { id } = req.params;

      const { path, nombre, tipo } = await RecursoService.prepararDescarga(id);

      await SocketService.notifyRecursoUpdate();

      if (tipo === "EXTERNAL") {
        return res.json({
          tipo: "EXTERNAL",
          url: path,
          nombre,
        });
      }

      res.download(path, nombre, (err) => {
        if (err && !res.headersSent) {
          res.status(500).json({ message: "ERROR_AL_PROCESAR_DESCARGA" });
        }
      });
    } catch (error) {
      const status = error.message.includes("NO_ENCONTRADO") ? 404 : 500;
      res.status(status).json({ message: error.message });
    }
  }
}

export default new RecursoController();
