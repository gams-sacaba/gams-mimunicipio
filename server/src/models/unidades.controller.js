const Unidad = require("../models/unidades.model");
const controller = require("./controller");
const logsController = require("./logs_registers.controller"); // Importar el controlador de logs

const referencia = ["id_dependencia", "id_cargo"];
const valores = {};
const changeMap = {
  id_dependencia: { field: "sigla", prop: "sigla" },
};

async function getElementos(req, res) {
  await controller.getAll(
    Unidad,
    req,
    res,
    "unidades",
    referencia,
    valores,
    changeMap
  );
}

async function getElemento(req, res) {
  await controller.getById(Unidad, req, res, "Unidad", referencia);
}

async function getCampoFiltrado(req, res) {
  await controller.getByFilterCamp(
    Unidad,
    req,
    res,
    "unidades",
    referencia,
    valores,
    changeMap
  );
}

async function getElementoFiltrado(req, res) {
  await controller.getByFilter(Unidad, req, res, "unidades", referencia);
}

async function createElemento(req, res) {
  try {
    await controller.create(Unidad, req, res, "Unidad"); // Si la creación fue exitosa, registrar auditoría
    let userRegister = {
      user: req.body.userRegister.user,
      accion: req.body.userRegister.accion,
      modulo: req.body.userRegister.modulo,
      dato_inicial: req.body.userRegister.dato_inicial,
    };
    await logsController.crearRegistroLogs(userRegister);
  } catch (error) {
    //console.error("Error en createElemento:", error); // Log para depuración
  }
}

async function updateElemento(req, res) {
  try {
    await controller.update(Unidad, req, res, "Unidad");

    // Si la actualización fue exitosa, registrar auditoría
    let userRegister = {
      user: req.body.userRegister.user,
      accion: req.body.userRegister.accion,
      modulo: req.body.userRegister.modulo,
      dato_inicial: req.body.userRegister.dato_inicial,
      dato_modificado: req.body.userRegister.dato_modificado,
    };
    await logsController.crearRegistroLogs(userRegister);
  } catch (error) {
    //console.error("Error en updateElemento:", error); // Log para depuración
  }
}

async function deleteElemento(req, res) {
  await controller.remove(Unidad, req, res, "Unidad");
}

module.exports = {
  getElementos,
  getElemento,
  getElementoFiltrado,
  getCampoFiltrado,
  createElemento,
  updateElemento,
  deleteElemento,
};
