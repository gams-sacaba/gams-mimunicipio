import mongoose from "mongoose";
import Solicitud from "./solicitudes.model.js";
import controller from "../../shared/controllers/main.controller.js";
import solicitudService from "./solicitudes.service.js";
import * as solicitudRepo from "./solicitudes.repository.js";
import socketService from "../../shared/services/socket.service.js";

const referencia = ["id_registro"];

export async function getElementos(req, res) {
  await controller.getAll(Solicitud, req, res, "solicitudes");
}

export async function getElemento(req, res) {
  await controller.getById(Solicitud, req, res, "Solicitud", referencia);
}

export async function createElemento(req, res) {
  const nuevaSolicitud = await controller.create(
    Solicitud,
    req,
    res,
    "Solicitud",
  );
  if (nuevaSolicitud && [200, 201].includes(res.statusCode)) {
    const solicitudConDatos = await solicitudService.getSolicitudById(
      nuevaSolicitud._id,
    );
    await socketService.notifySolicitudUpdate(solicitudConDatos);
  }
}

export async function updateElemento(req, res) {
  const { id } = req.params;
  const { esAprobador } = req.body;

  try {
    let solicitudActualizada;
    if (esAprobador) {
      solicitudActualizada = await solicitudService.processUpdateByAprobador(
        id,
        req.body,
      );
      res.status(200).json({
        message: "Solicitud actualizada por aprobador",
        solicitud: solicitudActualizada,
      });
    } else {
      await controller.update(Solicitud, req, res, "Solicitud");
      solicitudActualizada = await solicitudService.getSolicitudById(id);
    }

    if (solicitudActualizada)
      await socketService.notifySolicitudUpdate(solicitudActualizada);
  } catch (err) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

export async function deleteElemento(req, res) {
  const solicitudId = req.params.id;

  await controller.remove(Solicitud, req, res, "Solicitud");

  if (res.statusCode === 200 && solicitudId) {
    try {
      await socketService.removeAndNotify(solicitudId);
    } catch (err) {
      console.error("Error en la notificación post-borrado:", err);
    }
  }
}

export async function getCampoFiltrado(req, res) {}

export async function getElementoFiltrado(req, res) {
  const { elemento, campo, value } = req.params;
  try {
    const objectId = new mongoose.Types.ObjectId(campo);
    let data;

    if (value === "solicitudes") {
      if (elemento !== "id_registro")
        return res.status(400).json({ error: "Campo no permitido" });
      data = await solicitudService.getFuncionarioBandeja(objectId);
    } else if (value === "bandeja") {
      if (elemento !== "id_cargo_aprobador")
        return res.status(400).json({ error: "Campo no permitido" });
      data = await solicitudRepo.getAprobadorBandeja(objectId);
    } else {
      return res.status(400).json({ error: "Tipo no válido" });
    }

    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

export async function actualizacionExterna(req, res) {
  const { id } = req.body;

  try {
    const solicitudActualizada = await solicitudService.getSolicitudById(id);
    await socketService.notifySolicitudUpdate(solicitudActualizada);
  } catch (err) {
    console.error("Error al actualizar o notificar la solicitud externa:", err);
  }
}

export default {
  getElementos,
  getElemento,
  createElemento,
  updateElemento,
  deleteElemento,
  getElementoFiltrado,
  getCampoFiltrado,
  actualizacionExterna,
};
