import cron from "node-cron";
import Settings from "../../modules/settings/settings.model.js";
import userService from "../../modules/funcionarios/funcionarios.service.js";
import { forceLogoutUser } from "../config/sockets.config.js";

class CronService {
  constructor() {
    this.task = null;
    this.isInitialized = false;
    this.timezone = "America/La_Paz";
  }

  init() {
    if (this.isInitialized) {
      console.log("[CronService] El motor ya está en ejecución. Omitiendo...");
      return;
    }

    this.task = cron.schedule(
      "* * * * *",
      () => this.checkScheduledMaintenance(),
      {
        scheduled: true,
        timezone: this.timezone,
      },
    );

    this.isInitialized = true;
  }

  /**
   * @private
   */
  async checkScheduledMaintenance() {
    try {
      const ahora = new Date();
      const diaActual = ahora.getDay();

      const horaActual = ahora.toLocaleTimeString("es-BO", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: this.timezone,
      });

      const config = await Settings.findOne({ estado: true }).lean();
      if (!config || !config.programacion_mantenimiento) return;

      const tarea = config.programacion_mantenimiento.find(
        (t) =>
          t.activo &&
          t.dias.includes(diaActual) &&
          t.horas.includes(horaActual),
      );

      if (tarea) {
        await this.executeGlobalLogout(
          tarea.descripcion || "Mantenimiento Programado",
        );
      }
    } catch (error) {
      console.error("[CronService Error]:", error.message);
    }
  }

  /**
   * @param {String} motivo
   * @private
   */
  async executeGlobalLogout(motivo) {
    console.log(`[CronService]  Ejecutando Cierre Global: ${motivo}`);

    try {
      const { usuariosAfectados, total } =
        await userService.invalidateTokens(null);

      if (global.io && usuariosAfectados.length > 0) {
        usuariosAfectados.forEach((u) => {
          forceLogoutUser(global.io, u._id, "scheduled_maintenance");
        });
      }

      console.log(`[CronService]  Éxito: ${total} sesiones invalidadas.`);
    } catch (error) {
      console.error(
        "[CronService] Fallo al ejecutar invalidateTokens:",
        error.message,
      );
    }
  }

  stop() {
    if (this.task) {
      this.task.stop();
      this.isInitialized = false;
    }
  }
}

export default new CronService();
