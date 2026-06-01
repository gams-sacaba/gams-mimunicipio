import express from "express";
import { loginRateLimit } from "../../core/middlewares/rateLimiter.js";

import sessionRoutes from "../../modules/auth/auth.routes.js";
import officialRoutes from "../../modules/funcionarios/funcionarios.routes.js";
import detailRoutes from "../../modules/detalles/detalles.routes.js";
import contentRoutes from "../../modules/contenidos/contenidos.routes.js";
import resourceRoutes from "../../modules/recursos/recursos.routes.js";
import requestRoutes from "../../modules/solicitudes/solicitudes.routes.js";
import inboxRoutes from "../../modules/bandejas/bandejas.routes.js";
import dependencyRoutes from "../../modules/dependencias/dependencias.routes.js";
import unitRoutes from "../../modules/unidades/unidades.routes.js";
import settingsRoutes from "../../modules/settings/settings.routes.js";
import qrsRoutes from "../../modules/qrs/qrs.routes.js";

const router = express.Router();

router.use("/session", loginRateLimit, sessionRoutes);
router.use("/official", officialRoutes);
router.use("/detail", detailRoutes);
router.use("/content", contentRoutes);
router.use("/resources", resourceRoutes);
router.use("/request", requestRoutes);
router.use("/inbox", inboxRoutes);
router.use("/dependency", dependencyRoutes);
router.use("/unit", unitRoutes);
router.use("/settings", settingsRoutes);
router.use("/validators", qrsRoutes);

export default router;
