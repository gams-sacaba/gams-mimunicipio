import Settings from "./settings.model.js";

class SettingsService {
  constructor() {
    this.config = null;
  }

  async init() {
    try {
      const doc = await Settings.findOne({ estado: true }).lean();
      if (!doc) {
        console.warn("No se encontró documento de Settings activo.");
        this.config = {
          solicitud_config: {
            id_aprobador_final: "695808c0a886da9f714a6945",
          },
          recurso_config: {
            categoria: ["TODOS"],
            categoria_default: "TODOS",
          },
        };
        return;
      }
      const solConfig =
        doc.solicitud_config?.find((c) => c.activo === true) || {};
      const recConfig =
        doc.recurso_config?.find((c) => c.activo === true) || {};
      this.config = { solicitud_config: solConfig, recurso_config: recConfig };
      console.log("Settings cargados en memoria.");
    } catch (error) {
      console.error("Error cargando settings:", error);
    }
  }

  async getAll() {
    return await Settings.find().lean();
  }

  async getById(id) {
    return await Settings.findById(id).lean();
  }

  async update(id, datos) {
    const actualizado = await Settings.findByIdAndUpdate(id, datos, {
      new: true,
    });
    if (actualizado) {
      await this.reload();
    }
    return actualizado;
  }

  async create(datos) {
    const nuevo = new Settings(datos);
    await nuevo.save();
    await this.reload();
    return nuevo;
  }

  async reload() {
    await this.init();
  }

  getRedirecciones() {
    return this.config?.solicitud_config?.redireccion_aprobador || [];
  }

  async obtenerIdAprobadorFinal() {
    const default_approver = "695808c0a886da9f714a6945";
    return (
      this.config?.solicitud_config?.id_aprobador_final || default_approver
    );
  }
}

export default new SettingsService();
