import Recurso from "../recursos/recursos.model.js";
import Funcionario from "../funcionarios/funcionarios.model.js";
import Cargo from "../cargos/cargos.model.js";
import Dependencia from "../dependencias/dependencias.model.js";
import Nivel from "../niveles/niveles.model.js";
import Qr from "../qrs/qrs.model.js";

class QrService {
  async mostrarQr(codigo, hash) {
    const qr = await Qr.findOne({ codigo_unico: codigo, activo: true }).lean();
    if (!qr) throw new Error("QR_NO_VALIDO");

    const recurso = await Recurso.findOne({
      "control_qr.url_destino": `_${hash}`,
      "metadata.activo": true,
    }).lean();

    if (!recurso || !recurso.metadata?.activo) {
      throw new Error("RECURSO_NO_DISPONIBLE");
    }

    const infoLegal = [];

    if (qr.tipo === "CARGO" && recurso.filtros?.id_cargo?.length) {
      const cargo = await Cargo.findById(recurso.filtros.id_cargo[0]);
      if (cargo) infoLegal.push(`CARGO: ${cargo.nombre}`);
    }

    if (qr.tipo === "FUNCIONARIO" && recurso.filtros?.id_funcionario?.length) {
      const funcionario = await Funcionario.findById(
        recurso.filtros.id_funcionario[0],
      ).lean();
      if (funcionario)
        infoLegal.push(
          `FUNCIONARIO: ${funcionario.nombre} ${funcionario.paterno} ${funcionario.materno}`,
        );
    }

    if (qr.tipo === "DEPENDENCIA" && recurso.filtros?.id_dependencia?.length) {
      const dep = await Dependencia.findById(recurso.filtros.id_dependencia[0]);
      if (dep) infoLegal.push(`DEPENDENCIA: ${dep.sigla}`);
    }

    if (qr.tipo === "NIVEL" && recurso.filtros?.id_nivel_salarial?.length) {
      const nivel = await Nivel.findById(recurso.filtros.id_nivel_salarial[0]);
      if (nivel) infoLegal.push(`NIVEL SALARIAL: ${nivel.nombre}`);
    }

    if (qr.informacion_legal && qr.informacion_legal.length > 0) {
      infoLegal.push(...qr.informacion_legal);
    }

    return {
      valido: true,
      qr,
      recurso,
      infoLegal,
      fechaVerificacion: new Date(),
    };
  }
}

export default new QrService();
