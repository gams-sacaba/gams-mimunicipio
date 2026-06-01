import Detalle from "./detalles.model.js";
import controller from "../../shared/controllers/main.controller.js";

export async function getElementos(req, res) {
  await controller.getAll(Detalle, req, res, "detalles");
}

export async function getElemento(req, res) {
  await controller.getById(Detalle, req, res, "Detalle");
}

export async function createElemento(req, res) {
  await controller.create(Detalle, req, res, "Detalle");
}

export async function updateElemento(req, res) {}

export async function deleteElemento(req, res) {}

export async function getCampoFiltrado(req, res) {}

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
