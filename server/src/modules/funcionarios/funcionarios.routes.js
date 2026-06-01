import express from "express";
import ctrl from "./funcionarios.controller.js";
import { generarRutasCRUD } from "../../shared/routes/factory.routes.js";
import { validarFuncionario } from "../../shared/validators/validacionCreate.js";
import { validarActualizacionFuncionario } from "../../shared/validators/validacionUpdate.js";

const router = express.Router();

generarRutasCRUD(router, ctrl, {
  validadorCrear: validarFuncionario,
  validadorActualizar: validarActualizacionFuncionario,
  middlewaresExtra: [],
});

export default router;
