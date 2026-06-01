import Recurso from "./recursos.model.js";
import Settings from "../settings/settings.model.js";
import Funcionario from "../funcionarios/funcionarios.model.js";
import Registro from "../registros/registros.model.js";

import fs from "fs";
import path from "path";

class RecursoService {
  async getRecursosParaUsuario(userId) {
    const [funcionario, registro] = await Promise.all([
      Funcionario.findById(userId).select("role").lean(),
      Registro.findOne({ id_funcionario: userId, estado: true })
        .populate("id_cargo")
        .lean(),
    ]);

    if (!funcionario || !registro) throw new Error("PERFIL_INCOMPLETO");

    const idsSistemas = funcionario.role.map((r) => Number(r.acceso));
    const fechaActual = new Date();

    const query = {
      "metadata.activo": true,

      $or: [
        { "metadata.fechaExpiracion": { $gte: fechaActual } },
        { "metadata.fechaExpiracion": { $exists: false } },
        { "metadata.fechaExpiracion": null },
      ],
      $and: [
        {
          $or: [
            { "filtros.acceso_sistema": { $exists: false } },
            { "filtros.acceso_sistema": { $size: 0 } },
            {
              "filtros.acceso_sistema": { $in: idsSistemas },
            },
          ],
        },
        {
          $or: [
            { "filtros.id_cargo": { $exists: false } },
            { "filtros.id_cargo": { $size: 0 } },
            { "filtros.id_cargo": registro.id_cargo?._id },
          ],
        },
        {
          $or: [
            { "filtros.id_dependencia": { $exists: false } },
            { "filtros.id_dependencia": { $size: 0 } },
            { "filtros.id_dependencia": registro.id_cargo?.id_dependencia },
          ],
        },
        {
          $or: [
            { "filtros.id_nivel_salarial": { $exists: false } },
            { "filtros.id_nivel_salarial": { $size: 0 } },
            {
              "filtros.id_nivel_salarial": registro.id_cargo?.id_nivel_salarial,
            },
          ],
        },
        {
          $or: [
            { "filtros.tipo_contrato": { $exists: false } },
            { "filtros.tipo_contrato": { $size: 0 } },
            {
              "filtros.tipo_contrato":
                registro.id_cargo?.contrato?.toUpperCase(),
            },
          ],
        },
      ],
    };

    return await Recurso.find(query)
      .sort({ "metadata.fechaPublicacion": -1, createdAt: -1 })
      .lean();
  }

  async prepararDescarga(id) {
    const recurso = await Recurso.findById(id).lean();

    if (!recurso || !recurso.metadata?.activo) {
      throw new Error("RECURSO_NO_DISPONIBLE");
    }

    const fechaActual = new Date();
    if (
      recurso.metadata.fechaExpiracion &&
      recurso.metadata.fechaExpiracion < fechaActual
    ) {
      throw new Error("RECURSO_EXPIRADO");
    }

    let result = {};

    if (recurso.formato === "URL" && recurso?.archivo?.url_externa) {
      result = {
        tipo: "EXTERNAL",
        path: recurso.archivo.url_externa,
        nombre: recurso.archivo?.nombreOriginal || recurso.titulo,
      };
    } else {
      const baseStorage = process.env.STORAGE_PATH || "./storage";
      const filePath = recurso.archivo?.path;

      if (!filePath) throw new Error("RUTA_ARCHIVO_NO_DEFINIDA");

      const rutaCompleta = path.normalize(path.join(baseStorage, filePath));

      if (!fs.existsSync(rutaCompleta)) {
        console.error(`Archivo faltante en HDD: ${rutaCompleta}`);
        throw new Error("ARCHIVO_FISICO_NO_ENCONTRADO");
      }

      result = {
        tipo: "LOCAL",
        path: rutaCompleta,
        nombre: recurso.archivo.nombreOriginal,
      };
    }

    this.registrarDescarga(id);

    return result;
  }

  async obtenerPorId(id) {
    return await Recurso.findById(id).lean();
  }

  async registrarDescarga(id) {
    return await Recurso.findByIdAndUpdate(id, {
      $inc: { "metadata.descargas": 1 },
    });
  }

  async obtenerConfiguraciones() {
    const settings = await Settings.findOne({ estado: true })
      .select("recurso_config")
      .lean();

    return settings?.recurso_config || {};
  }
}

export default new RecursoService();
