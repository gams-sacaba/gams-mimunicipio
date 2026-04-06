//solicitudes.controller.js
const Solicitud = require("../models/solicitudes.model");
const controller = require("./controller");
const { notifySolicitudUpdateToUser } = require("../config/sockets");
const {
  getSolicitudById,
  notifySolicitudUpdate,
} = require("../helpers/solicitudes");
const mongoose = require("mongoose");
const referencia = ["id_registro"];

async function getElementos(req, res) {
  //await controller.getAll(Solicitud, req, res, "solicitudes");
}

async function getElemento(req, res) {
  //await controller.getById(Solicitud, req, res, "Solicitud", referencia);
}

async function createElemento(req, res) {
  try {
    const solicitudConDatos = await getSolicitudById(nuevaSolicitud._id);
    await notifySolicitudUpdate(solicitudConDatos);
  } catch (err) {
    console.error("Error al buscar la nueva solicitud para notificar:", err);
  }
}

async function updateElemento(req, res) {
  const solicitudId = req.params.id;
  //console.log("solicitud id: ", solicitudId);
  try {
    const solicitudActualizada = await getSolicitudById(solicitudId);
    await notifySolicitudUpdate(solicitudActualizada);
  } catch (err) {
    // console.error("Error al actualizar o notificar la solicitud:", err);
    // res.status(500).json({ error: "Error interno del servidor" });
  }
}

async function deleteElemento(req, res) {
  await controller.remove(Solicitud, req, res, "Solicitud");

  if (res.statusCode === 200) {
    const solicitudId = req.params.id;
    if (solicitudId) {
      try {
        const solicitudEliminada = await Solicitud.findById(
          solicitudId
        ).populate({
          path: "id_registro",
          populate: {
            path: "id_funcionario",
          },
        });

        if (
          solicitudEliminada &&
          solicitudEliminada.id_registro &&
          solicitudEliminada.id_registro.id_funcionario
        ) {
          const funcionarioId =
            solicitudEliminada.id_registro.id_funcionario._id;
          const payload = { _id: solicitudId, deleted: true };
          notifySolicitudUpdateToUser(global.io, funcionarioId, payload);
        }
      } catch (err) {
        console.error(
          "Error al buscar la solicitud eliminada para notificar:",
          err
        );
      }
    }
  }
}

async function getCampoFiltrado(req, res) {}

async function getElementoFiltrado(req, res) {
  try {
    const { elemento, campo, value } = req.params;

    switch (value) {
      case "solicitudes":
        return await getCampoFiltradoFuncionario(elemento, campo, res);

      case "bandeja":
        return await getCampoFiltradoAprobador(elemento, campo, res);

      default:
        return res.status(400).json({ error: "Tipo no válido" });
    }
  } catch (error) {
    console.error("Error en getSolicitudes:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

async function getCampoFiltradoFuncionario(elemento, campo, res) {
  try {
    //const { campo, value } = req.params;
    //console.log("Campo recibido:", campo, "Valor:", value);

    // Verificar que el campo exista en el esquema
    if (elemento !== "id_registro") {
      return res.status(400).json({ error: "Campo no permitido" });
    }

    // Convertir  a ObjectId
    const objectId = new mongoose.Types.ObjectId(campo);

    const solicitudes = await Solicitud.find({ id_registro: objectId })
      .populate("id_contenido")
      .sort({ _id: -1 })
      .lean();

    if (!solicitudes || solicitudes.length === 0) {
      console.log("No se encontraron resultados");
      return res.json([]);
    }

    res.json(solicitudes);
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

async function getCampoFiltradoAprobador(elemento, campo, res) {
  try {
    //const { campo, value } = req.params;
    console.log("Campo recibido:", elemento, "Valor:", campo);

    // Verificar que el campo exista en el esquema
    if (elemento !== "id_cargo_aprobador") {
      return res.status(400).json({ error: "Campo no permitido" });
    }

    // Convertir  a ObjectId
    const objectId = new mongoose.Types.ObjectId(campo);

    const solicitudes = await Solicitud.find({
      id_cargo_aprobador: objectId,
      estado: "ENVIADO",
    })
      .populate("id_contenido")
      .populate({
        path: "id_registro",
        populate: [
          {
            path: "id_cargo",
            select: "nombre contrato",
          },
          {
            path: "id_funcionario",
            select: "nombre paterno materno casada ci",
          },
        ],
      })
      .sort({ _id: -1 })
      .lean();

    if (!solicitudes || solicitudes.length === 0) {
      console.log("No se encontraron resultados");
      return res.json([]);
    }

    res.json(solicitudes);
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

module.exports = {
  getElementos,
  getElemento,
  createElemento,
  updateElemento,
  deleteElemento,
  getElementoFiltrado,
  getCampoFiltrado,
};
