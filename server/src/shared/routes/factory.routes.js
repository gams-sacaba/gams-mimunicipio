import { authMiddleware } from "../../modules/auth/auth.middleware.js";
import { validarSolicitud } from "../validators/validacion.js";

export const generarRutasCRUD = (router, controlador, config) => {
  const { validadorCrear, validadorActualizar, middlewares = [] } = config;

  const aplicar = (extras = []) => [...middlewares, ...extras];

  router.get("/", aplicar([authMiddleware]), controlador.getElementos);
  router.get("/:id", aplicar([authMiddleware]), controlador.getElemento);
  router.get(
    "/campo/:campo/:value",
    aplicar([authMiddleware]),
    controlador.getCampoFiltrado,
  );
  router.get(
    "/elemento/:elemento/:campo/:value",
    aplicar([authMiddleware]),
    controlador.getElementoFiltrado,
  );

  router.post(
    "/",
    aplicar([authMiddleware, validadorCrear(), validarSolicitud]),
    controlador.createElemento,
  );

  router.put(
    "/:id",
    aplicar([authMiddleware, validadorActualizar(), validarSolicitud]),
    controlador.updateElemento,
  );

  router.delete("/:id", aplicar([authMiddleware]), controlador.deleteElemento);
};
