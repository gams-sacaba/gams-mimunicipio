const controller = require("./controller");

const Funcionario = require("../models/funcionarios.model");
const Registro = require("../models/registros.model");
const Cargo = require("../models/cargos.model");
const Solicitud = require("../models/solicitudes.model");
const Rotacion = require("../models/rotaciones.model");
const Niveles = require("../models/niveles.model");
const Dependencias = require("../models/dependencias.model");
const Unidades = require("../models/unidades.model");

async function getElementos(req, res) {
  await controller.getAll(Funcionario, req, res, "funcionarios");
}

async function getElemento(req, res) {
  try {
    const { id } = req.params;

    const funcionario = await Funcionario.findById(id);
    if (!funcionario) {
      return res.status(404).json({ message: "Funcionario no encontrado" });
    }

    const registro = await Registro.findOne({
      id_funcionario: id,
      estado: true,
    })
      .populate({
        path: "id_cargo",
        populate: [
          { path: "id_nivel_salarial", select: "nombre" },
          { path: "id_dependencia", select: "nombre sigla" },
          { path: "id_unidad", select: "nombre clasificacion" },
          { path: "id_cargo_superior", select: "nombre" },
        ],
      })
      .exec();

    if (!registro) {
      return res.status(404).json({ message: "Registro activo no encontrado" });
    }

    //const solicitudes = await Solicitud.find({ id_registro: registro._id });

    const rotaciones = await Rotacion.find({
      id_registro: registro._id,
      estado: true,
    });

    return res.json({
      funcionario,
      registro,
      //solicitudes,
      rotaciones,
    });
  } catch (error) {
    //console.error(error);
    return res.status(500).json({ message: "Error del servidor" });
  }
}

async function createElemento(req, res) {
  await controller.create(Funcionario, req, res, "Funcionario");
}

async function updateElemento(req, res) {
  const evaluarCampos = [
    "paterno",
    "materno",
    "casada",
    "ext",
    "telefono",
    // "correo",
    // "domicilio.zona",
    // "domicilio.pasaje",
    // "domicilio.calle",
    // "domicilio.numero_casa",
  ];

  await controller.update(Funcionario, req, res, "Funcionario", evaluarCampos);
}

async function deleteElemento(req, res) {
  await controller.remove(Funcionario, req, res, "Funcionario");
}

async function getCampoFiltrado(req, res) {}

async function getElementoFiltrado(req, res) {}

module.exports = {
  getElementos,
  getElemento,
  createElemento,
  updateElemento,
  deleteElemento,
  getElementoFiltrado,
  getCampoFiltrado,
};
