const Detalle = require("../models/detalles.model");
const controller = require("./controller");

async function getElementos(req, res) {
  await controller.getAll(Detalle, req, res, "detalles");
}

async function getElemento(req, res) {
  await controller.getById(Detalle, req, res, "Detalle");
}

async function createElemento(req, res) {
  await controller.create(Detalle, req, res, "Detalle");
}

async function updateElemento(req, res) {}

async function deleteElemento(req, res) {}

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
