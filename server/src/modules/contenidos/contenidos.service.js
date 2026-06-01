import Contenido from "./contenidos.model.js";
import Solicitud from "../solicitudes/solicitudes.model.js";
import Funcionario from "../funcionarios/funcionarios.model.js";
import Registro from "../registros/registros.model.js";
import Detalles from "../detalles/detalles.model.js";

class ContenidoService {
  async getContenidosParaUsuario(userId) {
    const [user, registro, detalles] = await Promise.all([
      Funcionario.findById(userId).lean(),
      Registro.findOne({ id_funcionario: userId, estado: true })
        .populate("id_cargo")
        .lean(),
      Detalles.findOne({ id_funcionario: userId }).lean(),
    ]);

    if (!user || !registro) throw new Error("PERFIL_INCOMPLETO");

    const perfil = {
      tipoContrato: registro.tipo_contrato,
      contrato: registro.id_cargo?.contrato,
      genero: user.genero || "F",
      hijos: detalles?.hijos > 0 ? "C" : "S",
      estado_civil: detalles?.estado_civil || "S",
      fecha_nacimiento: user.fecha_nacimiento,
    };

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const inicioAnio = new Date(hoy.getFullYear(), 0, 1);
    const finAnio = new Date(hoy.getFullYear(), 11, 31, 23, 59, 59);

    const [contenidos, solicitudesCU] = await Promise.all([
      Contenido.find({ estado: true }).lean(),
      Solicitud.find({
        id_registro: registro._id,
        estado: { $ne: "RECHAZADO" },
        fecha_envio: { $gte: inicioAnio, $lte: finAnio },
      })
        .select("id_contenido")
        .lean(),
    ]);

    let tieneVacacionHabilitada = false;
    if (perfil.contrato === "ITEM") {
      tieneVacacionHabilitada = await this.tieneDerechoAVacacion(userId);
    }

    let filtrados = contenidos.filter((c) => {
      if (c.denominacion === "VA" && !tieneVacacionHabilitada) return false;

      if (c.denominacion === "CU") {
        if (!perfil.fecha_nacimiento) return false;

        const cumpleEsteAnio = new Date(
          hoy.getFullYear(),
          new Date(perfil.fecha_nacimiento).getMonth(),
          new Date(perfil.fecha_nacimiento).getDate(),
        );
        cumpleEsteAnio.setHours(0, 0, 0, 0);

        const yaPaso = cumpleEsteAnio < hoy;
        const yaSolicito = solicitudesCU.some(
          (s) => String(s.id_contenido) === String(c._id),
        );

        if (yaPaso || yaSolicito) return false;
      }

      const r = c.restricciones || {};
      if (r.contratos?.length > 0 && !r.contratos.includes(perfil.contrato))
        return false;
      if (c.tipo_contrato && c.tipo_contrato !== perfil.tipoContrato)
        return false;
      if (r.genero?.length > 0 && !r.genero.includes(perfil.genero))
        return false;
      if (r.hijos?.length > 0 && !r.hijos.includes(perfil.hijos)) return false;
      if (
        r.estado_civil?.length > 0 &&
        !r.estado_civil.includes(perfil.estado_civil)
      )
        return false;

      return true;
    });

    return filtrados
      .map((c) => ({ ...c, perfil }))
      .sort((a, b) => {
        const ordenA = a.orden || 999;
        const ordenB = b.orden || 999;
        return ordenA - ordenB;
      });
  }

  async tieneDerechoAVacacion(funcionarioId) {
    const historicoRaw = await Registro.find({ id_funcionario: funcionarioId })
      .populate("id_cargo")
      .lean();

    if (!historicoRaw || historicoRaw.length === 0) return false;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const unDiaMs = 24 * 60 * 60 * 1000;

    const toDateOnly = (fecha) => {
      const d = new Date(fecha);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    };

    const registroActivo = historicoRaw.find((r) => r.estado === true);

    if (!registroActivo) {
      return false;
    }

    const intervalos = historicoRaw
      .map((r) => {
        if (!r.fecha_ingreso) return null;

        const inicio = toDateOnly(r.fecha_ingreso);
        let fin = null;

        if (r.fecha_conclusion) {
          fin = toDateOnly(r.fecha_conclusion);
        } else if (r._id.toString() === registroActivo._id.toString()) {
          fin = toDateOnly(hoy);
        } else {
          return null;
        }

        if (fin > hoy) fin = toDateOnly(hoy);

        return { inicio, fin };
      })
      .filter(Boolean);

    if (intervalos.length === 0) return false;

    intervalos.sort((a, b) => a.inicio - b.inicio);

    const bloques = [];

    for (const actual of intervalos) {
      if (bloques.length === 0) {
        bloques.push({ ...actual });
        continue;
      }

      const ultimo = bloques[bloques.length - 1];

      const diffDias = Math.floor((actual.inicio - ultimo.fin) / unDiaMs);

      if (diffDias <= 1) {
        if (actual.fin > ultimo.fin) {
          ultimo.fin = actual.fin;
        }
      } else {
        bloques.push({ ...actual });
      }
    }

    const bloqueActual = bloques.find((b) => hoy >= b.inicio && hoy <= b.fin);

    if (!bloqueActual) {
      return false;
    }

    const diasTotales = Math.floor((hoy - bloqueActual.inicio) / unDiaMs) + 1;

    return diasTotales >= 367;
  }
}

export default new ContenidoService();
