//routerUtils.js
const authMiddleware = require("../middlewares/auth");
const { validarSolicitud } = require("../middlewares/validacion");

const controladores = {
  session: require("../controllers/session.controller"),
  official: require("../controllers/funcionarios.controller"),
  detail: require("../controllers/detalles.controller"),
  request: require("../controllers/solicitudes.controller"),
  content: require("../controllers/contenidos.controller"),
  connectionrequest: require("../controllers/connection.solicitudes.controller"),
  inbox: require("../controllers/bandeja.controller"),
  unit: require("../controllers/unidades.controller"),
  dependency: require("../controllers/dependencias.controller"),
  settings: require("../controllers/settings.controller"),
};

function rutas(
  router,
  controlador,
  validadorCrear,
  validadorActualizar,
  ...middlewares // Pasa middlewares adicionales como resto de parámetros
) {
  const aplicarMiddlewares = (rutaMiddlewares) => [
    ...middlewares,
    ...rutaMiddlewares,
  ];

  // GETs protegidos con authMiddleware
  router.get(
    `/${controlador}`,
    aplicarMiddlewares([authMiddleware]),
    controladores[controlador].getElementos,
  );
  router.get(
    `/${controlador}/:id`,
    aplicarMiddlewares([authMiddleware]),
    controladores[controlador].getElemento,
  );
  router.get(
    `/${controlador}/campo/:campo/:value`,
    aplicarMiddlewares([authMiddleware]),
    controladores[controlador].getCampoFiltrado,
  );
  router.get(
    `/${controlador}/elemento/:elemento/:campo/:value`,
    aplicarMiddlewares([authMiddleware]),
    controladores[controlador].getElementoFiltrado,
  );

  // POST (login) normalmente no requiere authMiddleware
  router.post(
    `/${controlador}`,
    aplicarMiddlewares([validadorCrear(), validarSolicitud]),
    controladores[controlador].createElemento,
  );

  router.put(
    `/${controlador}/:id`,
    aplicarMiddlewares([
      //authMiddleware,
      validadorActualizar(),
      validarSolicitud,
    ]),
    controladores[controlador].updateElemento,
  );

  router.delete(
    `/${controlador}/:id`,
    aplicarMiddlewares([validadorCrear(), validarSolicitud]),
    controladores[controlador].deleteElemento,
  );
}

module.exports = { rutas };
