// services/settings.service.js
const Settings = require("../models/settings.model");

class SettingsService {
  constructor() {
    this.config = null;
  }

  async init() {
    try {
      const doc = await Settings.findOne({ estado: true }).lean();
      this.config = doc || { redireccion_aprobador: [] };
      console.log("Settings cargados en memoria.");
    } catch (error) {
      console.error("Error cargando settings:", error);
    }
  }

  getRedirecciones() {
    return this.config?.redireccion_aprobador || [];
  }

  async reload() {
    await this.init();
  }
}

module.exports = new SettingsService();
