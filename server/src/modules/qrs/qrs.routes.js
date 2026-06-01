import express from "express";
import ctrl from "./qrs.controller.js";

const router = express.Router();

router.get("/:codigoHash", ctrl.validarQr);

export default router;
