import express from "express";
import ctrl from "./recursos.controller.js";
import { authMiddleware } from "../auth/auth.middleware.js";

const router = express.Router();

router.get("/settings", authMiddleware, ctrl.obtenerConfiguraciones);
router.get("/available", authMiddleware, ctrl.obtenerDisponibles);

router.post("/notify-external", authMiddleware, ctrl.notificarActualizacion);

router.get("/download/:id", authMiddleware, ctrl.descargar);

export default router;
