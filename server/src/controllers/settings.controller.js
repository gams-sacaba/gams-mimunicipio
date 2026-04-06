const Settings = require("../models/settings.model");
const settingsService = require("../services/settings.service");

async function getElementos(req, res) {
  try {
    const settings = await Settings.find().lean();
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener configuraciones" });
  }
}

async function getElemento(req, res) {
  try {
    const setting = await Settings.findById(req.params.id).lean();
    res.status(200).json(setting);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener la configuración" });
  }
}

async function updateElemento(req, res) {
  try {
    const { id } = req.params;
    const datosActualizar = req.body;
    const actualizado = await Settings.findByIdAndUpdate(id, datosActualizar, {
      new: true,
    });

    if (actualizado) {
      await settingsService.reload();
      //console.log("Memoria de Settings actualizada tras cambio en DB.");

      res.status(200).json(actualizado);
    } else {
      res.status(404).json({ message: "Configuración no encontrada" });
    }
  } catch (error) {
    console.error("Error al actualizar settings:", error);
    res.status(500).json({ message: "Error interno al actualizar" });
  }
}

// Estos podrías dejarlos vacíos o con lógica simple según necesites
async function createElemento(req, res) {
  try {
    const nuevo = new Settings(req.body);
    await nuevo.save();
    await settingsService.reload();
    res.status(201).json(nuevo);
  } catch (error) {
    res.status(500).json({ message: "Error al crear configuración" });
  }
}

async function deleteElemento(req, res) {
  res.status(405).json({
    message: "No se permite eliminar el documento maestro de configuración",
  });
}

async function getCampoFiltrado(req, res) {}
async function getElementoFiltrado(req, res) {}

module.exports = {
  getElementos,
  getElemento,
  updateElemento,
  createElemento,
  deleteElemento,
  getCampoFiltrado,
  getElementoFiltrado,
};
