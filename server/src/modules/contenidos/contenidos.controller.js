import contenidoService from "./contenidos.service.js";
import Contenido from "./contenidos.model.js";
import controller from "../../shared/controllers/main.controller.js";
import { broadcastContenidoUpdate } from "../../core/config/sockets.config.js";

export async function getElementos(req, res) {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "ID de usuario requerido" });

    const ordenados = await contenidoService.getContenidosParaUsuario(id);
    res.json(ordenados);
  } catch (err) {
    const status = err.message === "PERFIL_INCOMPLETO" ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
}

export async function getElemento(req, res) {
  await controller.getById(Contenido, req, res, "Contenido", referencia);
}

export async function createElemento(req, res) {
  await controller.create(Contenido, req, res, "Contenido");
  if ([200, 201].includes(res.statusCode)) broadcastContenidoUpdate(global.io);
}

export async function updateElemento(req, res) {
  await controller.update(Contenido, req, res, "Contenido");
  if (res.statusCode === 200) broadcastContenidoUpdate(global.io);
}

export async function deleteElemento(req, res) {
  await controller.remove(Contenido, req, res, "Contenido");
  if (res.statusCode === 200) broadcastContenidoUpdate(global.io);
}

export async function getCampoFiltrado(req, res) {
  await controller.getByFilterCamp(
    Unidad,
    req,
    res,
    "unidades",
    referencia,
    valores,
    changeMap,
  );
}

export async function getElementoFiltrado(req, res) {
  await controller.getByFilter(Unidad, req, res, "unidades", referencia);
}

export default {
  getElementos,
  getElemento,
  createElemento,
  updateElemento,
  deleteElemento,
  getCampoFiltrado,
  getElementoFiltrado,
};
