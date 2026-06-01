import controller from "../../shared/controllers/main.controller.js";
import Funcionario from "./funcionarios.model.js";
import userService from "./funcionarios.service.js";

export async function getElementos(req, res) {
  await controller.getAll(Funcionario, req, res, "funcionarios");
}

export async function getElemento(req, res) {
  try {
    const { id } = req.params;
    const perfil = await userService.getFullProfile(id);

    if (!perfil) {
      return res.status(404).json({ message: "Funcionario no encontrado" });
    }
    if (!perfil.registro) {
      return res.status(404).json({ message: "Registro activo no encontrado" });
    }

    return res.json(perfil);
  } catch (error) {
    return res.status(500).json({ message: "Error del servidor" });
  }
}

export async function createElemento(req, res) {
  await controller.create(Funcionario, req, res, "Funcionario");
}

export async function updateElemento(req, res) {
  const evaluarCampos = ["paterno", "materno", "casada", "ext", "telefono"];

  await controller.update(Funcionario, req, res, "Funcionario", evaluarCampos);
}

export async function deleteElemento(req, res) {
  await controller.remove(Funcionario, req, res, "Funcionario");
}

export async function getCampoFiltrado(req, res) {}

export async function getElementoFiltrado(req, res) {}

export default {
  getElementos,
  getElemento,
  createElemento,
  updateElemento,
  deleteElemento,
  getElementoFiltrado,
  getCampoFiltrado,
};
