const mongoose = require("mongoose");

const cargoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, "El objetivo es requerido."],
    maxlength: [100, "El nombre de cargo no debe exceder los 100 caracteres."],
    uppercase: true,
  },
  denominacion: {
    type: String,
    maxlength: [
      50,
      "La denominacion de cargo no debe exceder los 50 caracteres.",
    ],
    uppercase: true,
  },
  contrato: {
    type: String,
    required: [true, "El tipo de contrato es requerido."],
    uppercase: true,
    enum: ["ITEM", "EVENTUAL", "REMANENTE", "CONSULTOR"],
  },
  categoria: {
    type: String,
    uppercase: true,
    enum: ["SUPERIOR", "EJECUTIVO", "OPERATIVO"],
  },
  clasificacion: {
    type: String,
    maxlength: [
      15,
      "La clasificacion de cargo no debe exceder los 15 caracteres.",
    ],
    uppercase: true,
  },
  clase: {
    type: String,
    maxlength: [10, "La clase de cargo no debe exceder los 10 caracteres."],
    uppercase: true,
  },
  rotacion: {
    type: Boolean,
    default: false,
  },
  registro: {
    type: Number,
    required: [true, "El reqistro es requerido."],
    maxlength: [5, "El registro no debe exceder los 5 dígitos"],
  },
  duracion_contrato: {
    type: Number,
    maxlength: [3, " La duracion de contrato no debe exceder los 3 dìgitos."],
  },
  objetivo: {
    type: String,
    maxlength: [300, "El objetivo no debe exceder los 300 caracteres."],
    uppercase: true,
  },
  estado: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  id_partida: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Partidas",
  },
  id_nivel_salarial: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Niveles",
    required: [true, "Debe agregar el nivel salarial."],
  },
  id_dependencia: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Dependencias",
    required: true,
  },
  id_unidad: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Unidades",
  },
  cargo_principal: {
    type: Boolean,
  },
  id_cargo_superior: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cargos",
  },
  //   id_cargo_dependiente: {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "Cargos",
  //   },
  aprobador: { type: Boolean, default: false }, // si este cargo es aprobador principal
  aprobador_secundario: {
    type: mongoose.Types.ObjectId,
    ref: "Cargos", // id del cargo que delega al dependiente como secundario
    default: null,
  },
});

cargoSchema.index({ nombre: 1, contrato: 1 });

module.exports = mongoose.model("Cargos", cargoSchema);
