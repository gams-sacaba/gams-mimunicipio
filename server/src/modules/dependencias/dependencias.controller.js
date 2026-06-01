import Dependencia from "./dependencias.model.js";
import controller from "../../shared/controllers/main.controller.js";

export async function getElementos(req, res) {
  const referencia = ["id_dependencia"];
  await controller.getAll(Dependencia, req, res, "dependencias", referencia);
}

export async function getElemento(req, res) {
  const referencia = ["id_dependencia"];
  await controller.getById(Dependencia, req, res, "Dependencia", referencia);
}

export async function getCampoFiltrado(req, res) {
  const referencia = ["id_dependencia"];
  await controller.getByFilterCamp(
    Dependencia,
    req,
    res,
    "dependencias",
    referencia,
  );
}

export async function getElementoFiltrado(req, res) {
  const referencia = ["id_dependencia"];
  await controller.getByFilter(
    Dependencia,
    req,
    res,
    "Dependencia",
    referencia,
  );
}

export async function createElemento(req, res) {
  try {
    await controller.create(Dependencia, req, res, "Dependencia");
  } catch (error) {}
}

export async function updateElemento(req, res) {
  const evaluarCampos = ["id_dependencia"];
  try {
    await controller.update(
      Dependencia,
      req,
      res,
      "Dependencia",
      evaluarCampos,
    );
  } catch (error) {}
}

export async function deleteElemento(req, res) {
  await controller.remove(Dependencia, req, res, "Dependencia");
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
