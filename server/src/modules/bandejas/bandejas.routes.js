import express from "express";
import ctrl from "./bandejas.controller.js";
import { generarRutasCRUD } from "../../shared/routes/factory.routes.js";
import { validarUsuario } from "../../shared/validators/validacionCreate.js";
import { validarActualizacionUsuario } from "../../shared/validators/validacionUpdate.js";

const router = express.Router();

generarRutasCRUD(router, ctrl, {
  validadorCrear: validarUsuario,
  validadorActualizar: validarActualizacionUsuario,
});

export default router;
