import Solicitud from "../solicitudes/solicitudes.model.js";
import controller from "../../shared/controllers/main.controller.js";
import * as bandejaRepo from "./bandejas.repository.js";
import socketService from "../../shared/services/socket.service.js";

const referencia = ["id_registro"];

export async function getElementos(req, res) {
  await controller.getAll(Solicitud, req, res, "solicitudes");
}

export async function getElemento(req, res) {
  await controller.getById(Solicitud, req, res, "Solicitud", referencia);
}

export async function createElemento(req, res) {
  const nueva = await controller.create(Solicitud, req, res, "Solicitud");
  if (nueva && [200, 201].includes(res.statusCode)) {
    await socketService.notify(nueva._id);
  }
}

export async function updateElemento(req, res) {
  await controller.update(Solicitud, req, res, "Solicitud");
  if (res.statusCode === 200) {
    await socketService.notify(req.params.id);
  }
}

export async function deleteElemento(req, res) {
  const { id } = req.params;

  const payload = { _id: id, deleted: true };
  await socketService.notify(id, payload);

  await controller.remove(Solicitud, req, res, "Solicitud");
}

export async function getCampoFiltrado(req, res) {
  try {
    const { value } = req.params;
    const solicitudes = await bandejaRepo.getBandejaPorCargo(value);
    res.json(solicitudes || []);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener bandeja" });
  }
}

export async function getElementoFiltrado(req, res) {}

export default {
  getElementos,
  getElemento,
  createElemento,
  updateElemento,
  deleteElemento,
  getElementoFiltrado,
  getCampoFiltrado,
};
