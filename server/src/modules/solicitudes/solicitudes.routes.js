import express from "express";
import ctrl from "./solicitudes.controller.js";
import { generarRutasCRUD } from "../../shared/routes/factory.routes.js";
import { validarUsuario } from "../../shared/validators/validacionCreate.js";
import { validarActualizacionUsuario } from "../../shared/validators/validacionUpdate.js";
import { authMiddleware } from "../auth/auth.middleware.js";

const router = express.Router();

router.put("/notify-external", authMiddleware, ctrl.actualizacionExterna);

generarRutasCRUD(router, ctrl, {
  validadorCrear: validarUsuario,
  validadorActualizar: validarActualizacionUsuario,
});

export default router;
