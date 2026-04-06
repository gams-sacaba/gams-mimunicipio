// controllers/contenidoController.js
const Contenido = require("../models/contenidos.model");
const Solicitud = require("../models/solicitudes.model");
const Funcionario = require("../models/funcionarios.model");
const Registro = require("../models/registros.model");
const Cargo = require("../models/cargos.model");
const Detalles = require("../models/detalles.model");
const controller = require("./controller");

const mongoose = require("mongoose");

const { broadcastContenidoUpdate } = require("../config/sockets");

async function getElementos(req, res) {
  try {
    const { id } = req.query;
    const userId = new mongoose.Types.ObjectId(id);
    if (!userId)
      return res.status(401).json({ error: "Usuario no autenticado" });

    // Buscar usuario
    const user = await Funcionario.findById(userId);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    // Buscar registro activo
    const registro = await Registro.findOne({
      id_funcionario: userId,
      estado: true,
    })
      .populate("id_cargo")
      .lean();

    if (!registro)
      return res.status(404).json({ error: "Registro activo no encontrado" });

    // Buscar detalles adicionales
    const detalles = await Detalles.findOne({ id_funcionario: userId }).lean();

    // Perfil consolidado
    const perfil = {
      tipoContrato: registro.tipo_contrato,
      contrato: registro.id_cargo?.contrato,
      genero: user.genero || "F",
      hijos: detalles?.hijos > 0 ? "C" : "S" || "S",
      estado_civil: detalles?.estado_civil || "S",
      fecha_nac: user?.fecha_nacimiento || "",
    };
    //console.log("Perfil de usuario:", perfil);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const anioActual = hoy.getFullYear();

    const inicioAnio = new Date(anioActual, 0, 1, 0, 0, 0, 0); // 01-01
    const finAnio = new Date(anioActual, 11, 31, 23, 59, 59, 999); // 31-12
    // Obtener todos los contenidos activos
    const contenidos = await Contenido.find({ estado: true }).lean();
    const cumpleaniosContenido = contenidos.find(
      (c) => c.denominacion === "CU",
    );
    const solicitudesCumpleAnio = await Solicitud.find({
      id_registro: registro._id,
      id_contenido: cumpleaniosContenido._id,
      estado: { $ne: "RECHAZADO" },
      fecha_envio: { $gte: inicioAnio, $lte: finAnio },
    }).lean();
    const yaTieneSolicitudCU = solicitudesCumpleAnio.length > 0;

    // Filtrar contenidos según restricciones
    let filtrados = contenidos.filter((c) => {
      //Cumpleaños
      if (c.denominacion === "CU") {
        const fechaNac = user.fecha_nacimiento
          ? new Date(user.fecha_nacimiento)
          : null;

        if (!fechaNac) return false;

        // Cumpleaños en este año
        const cumpleEsteAnio = new Date(
          hoy.getFullYear(),
          fechaNac.getMonth(),
          fechaNac.getDate(),
        );
        cumpleEsteAnio.setHours(0, 0, 0, 0);
        // console.log("Cumpleaños este año:", cumpleEsteAnio);
        // console.log("Hoy:", hoy);
        // Si ya cumplió años este año -> NO mostrar
        if (cumpleEsteAnio < hoy) return false;
        if (yaTieneSolicitudCU) return false;
      }

      // contrato
      if (
        c.restricciones?.contratos?.length > 0 &&
        !c.restricciones.contratos.includes(perfil.contrato)
      )
        return false;

      // tipo contrato
      if (c.tipo_contrato && c.tipo_contrato !== perfil.tipoContrato)
        return false;

      // género
      if (
        c.restricciones?.genero.length > 0 &&
        !c.restricciones.genero.includes(perfil.genero)
      )
        return false;

      // hijos
      if (
        c.restricciones?.hijos.length > 0 &&
        !c.restricciones.hijos.includes(perfil.hijos)
      )
        return false;

      //Estado civil
      if (
        c.restricciones?.estado_civil?.length > 0 &&
        !c.restricciones.estado_civil.includes(perfil.estado_civil)
      )
        return false;

      return true;
    });
    filtrados = filtrados.map((c) => ({
      ...c,
      perfil,
    }));

    const ordenados = filtrados.sort((a, b) => {
      const ordenA = a.orden || 0; // si no tiene orden o es 0
      const ordenB = b.orden || 0;

      if (ordenA === 0 && ordenB === 0) return 0; // ambos al final
      if (ordenA === 0) return 1; // A va al final
      if (ordenB === 0) return -1; // B va al final
      return ordenA - ordenB; // orden ascendente
    });
    res.json(ordenados);
  } catch (err) {
    console.error("Error obteniendo getElemento:", err);
    res.status(500).json({ error: "Error obteniendo contenidos" });
  }
}

async function getElemento(req, res) {}

async function createElemento(req, res) {
  await controller.create(Contenido, req, res, "Contenido");
  if (res.statusCode === 200 || res.statusCode === 201) {
    // Ajusta según tu controller.create
    broadcastContenidoUpdate(global.io);
  }
}

async function updateElemento(req, res) {
  await controller.update(Contenido, req, res, "Contenido");
  // Si la actualización fue exitosa, notifica a todos
  if (res.statusCode === 200) {
    // Ajusta según tu controller.update
    broadcastContenidoUpdate(global.io);
  }
}

async function deleteElemento(req, res) {
  await controller.remove(Contenido, req, res, "Contenido");
  // Si la eliminación fue exitosa, notifica a todos
  if (res.statusCode === 200) {
    // Ajusta según tu controller.remove
    broadcastContenidoUpdate(global.io);
  }
}

async function getCampoFiltrado(req, res) {}

async function getElementoFiltrado(req, res) {}

module.exports = {
  getElementos,
  getElemento,
  createElemento,
  updateElemento,
  deleteElemento,
  getElementoFiltrado,
  getCampoFiltrado,
};
