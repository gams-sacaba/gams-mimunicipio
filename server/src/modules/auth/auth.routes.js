import express from "express";
import ctrl from "./auth.controller.js";
import { generarRutasCRUD } from "../../shared/routes/factory.routes.js";
import { validarUsuario } from "../../shared/validators/validacionCreate.js";
import { validarActualizacionUsuario } from "../../shared/validators/validacionUpdate.js";
import { authMiddleware } from "./auth.middleware.js";

const router = express.Router();

router.post("/login-session", ctrl.loginSession);

router.put("/reset-session", authMiddleware, ctrl.resetSession);
router.put("/reset-password", authMiddleware, ctrl.resetPassword);

generarRutasCRUD(router, ctrl, {
  validadorCrear: validarUsuario,
  validadorActualizar: validarActualizacionUsuario,
});

export default router;
