import Unidad from "./unidades.model.js";
import controller from "../../shared/controllers/main.controller.js";

const referencia = ["id_dependencia", "id_cargo"];
const valores = {};
const changeMap = {
  id_dependencia: { field: "sigla", prop: "sigla" },
};

export async function getElementos(req, res) {
  await controller.getAll(
    Unidad,
    req,
    res,
    "unidades",
    referencia,
    valores,
    changeMap,
  );
}

export async function getElemento(req, res) {
  await controller.getById(Unidad, req, res, "Unidad", referencia);
}

export async function createElemento(req, res) {
  try {
    await controller.create(Unidad, req, res, "Unidad");
  } catch (error) {}
}

export async function updateElemento(req, res) {
  try {
    await controller.update(Unidad, req, res, "Unidad");
  } catch (error) {}
}

export async function deleteElemento(req, res) {
  await controller.remove(Unidad, req, res, "Unidad");
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
  getElementoFiltrado,
  getCampoFiltrado,
};
