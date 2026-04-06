// router.js
const express = require("express");
const router = express.Router();
const { rutas } = require("./routerUtils");
const { loginRateLimit } = require("../middlewares/rateLimiter");
const {
  validarUsuario,
  validarFuncionario,
  validarDetalle,
  validarContenido,
  validarSolicitud,
  validarBandeja,
  validarDependencia,
  validarUnidad,
  validarSettings,
} = require("../middlewares/validacionCreate");
const {
  validarActualizacionUsuario,
  validarActualizacionFuncionario,
  validarActualizacionDetalle,
  validarActualizacionContenido,
  validarActualizacionSolicitud,
  validarActualizacionBandeja,
  validarActualizacionDependencia,
  validarActualizacionUnidad,
  validarActualizacionSettings,
} = require("../middlewares/validacionUpdate");

// Definición de rutas
rutas(
  router,
  "session",
  validarUsuario,
  validarActualizacionUsuario,
  loginRateLimit,
);
rutas(router, "official", validarFuncionario, validarActualizacionFuncionario);
rutas(router, "detail", validarDetalle, validarActualizacionDetalle);
rutas(router, "content", validarContenido, validarActualizacionContenido);
rutas(router, "request", validarSolicitud, validarActualizacionSolicitud);
rutas(
  router,
  "connectionrequest",
  validarSolicitud,
  validarActualizacionSolicitud,
);
rutas(router, "inbox", validarBandeja, validarActualizacionBandeja);
rutas(
  router,
  "dependency",
  validarDependencia,
  validarActualizacionDependencia,
);
rutas(router, "unit", validarUnidad, validarActualizacionUnidad);

rutas(router, "settings", validarSettings, validarActualizacionSettings);

module.exports = router;
