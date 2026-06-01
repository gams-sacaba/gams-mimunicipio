import settingsService from "./settings.service.js";

export async function getElementos(req, res) {
  try {
    const settings = await settingsService.getAll();
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener configuraciones" });
  }
}

export async function getElemento(req, res) {
  try {
    const setting = await settingsService.getById(req.params.id);
    if (!setting) return res.status(404).json({ message: "No encontrado" });
    res.status(200).json(setting);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener la configuración" });
  }
}

export async function updateElemento(req, res) {
  try {
    const actualizado = await settingsService.update(req.params.id, req.body);
    if (actualizado) {
      res.status(200).json(actualizado);
    } else {
      res.status(404).json({ message: "Configuración no encontrada" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error interno al actualizar" });
  }
}

export async function createElemento(req, res) {
  try {
    const nuevo = await settingsService.create(req.body);
    res.status(201).json(nuevo);
  } catch (error) {
    res.status(500).json({ message: "Error al crear configuración" });
  }
}

export async function deleteElemento(req, res) {
  res.status(405).json({
    message: "No se permite eliminar el documento maestro de configuración",
  });
}

export async function getCampoFiltrado(req, res) {
  await controller.getByFilterCamp(
    Unidad,
    req,
    res,
    "unidades",
    referencia,
    valores,
    changeMap,
  );
}

export async function getElementoFiltrado(req, res) {
  await controller.getByFilter(Unidad, req, res, "unidades", referencia);
}

export default {
  getElementos,
  getElemento,
  createElemento,
  updateElemento,
  deleteElemento,
  getCampoFiltrado,
  getElementoFiltrado,
};
