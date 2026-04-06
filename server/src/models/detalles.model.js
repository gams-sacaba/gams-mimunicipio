const mongoose = require("mongoose");

const detallesSchema = new mongoose.Schema({
  titulo: {
    type: String,
    uppercase: true,
    maxlength: [80, "El título no puede exceder los 80 caracteres."],
  },
  grado: {
    type: String,
    uppercase: true,
    enum: [
      "NINGUNO",
      "TECNICO BASICO",
      "TECNICO MEDIO",
      "TECNICO SUPERIOR",
      "LICENCIATURA",
    ],
  },
  ficha: {
    type: String,
    uppercase: true,
    enum: ["NO", "SI", "ACTUALIZAR"],
  },
  egreso: {
    type: String,
    uppercase: true,
    enum: ["NO", "SI", "ACTUALIZAR"],
  },
  estudio: {
    type: String,
    uppercase: true,
    enum: ["NO", "SI", "ACTUALIZAR"],
  },
  diploma: {
    type: String,
    uppercase: true,
    enum: ["NO", "SI", "ACTUALIZAR"],
  },
  fotocopia: {
    type: String,
    uppercase: true,
    enum: ["NO", "SI", "ACTUALIZAR"],
  },
  documentos: [
    {
      type: String,
      uppercase: true,
    },
  ],
  ddjj: [
    {
      type: String,
      uppercase: true,
    },
  ],
  certificados: [
    {
      type: String,
      uppercase: true,
    },
  ],
  licencias: [
    {
      type: String,
      uppercase: true,
    },
  ],
  diplomados: [
    {
      type: String,
      uppercase: true,
    },
  ],
  experiencia: {
    type: String,
    uppercase: true,
    maxlength: [30, "La experiencia no puede exceder los 30 caracteres."],
  },
  hijos: {
    type: Number,
    maxlength: [2, " Cantidad hijos no debe exceder los 2 dìgitos."],
  },
  padre: {
    type: String,
    uppercase: true,
    maxlength: [50, "El grado no puede exceder los 50 caracteres."],
  },
  madre: {
    type: String,
    uppercase: true,
    maxlength: [50, "El grado no puede exceder los 50 caracteres."],
  },
  evaluacion: {
    type: String,
    uppercase: true,
    enum: [
      "NO",
      "DEFICIENTE",
      "INSATISFACTORIO",
      "BUENO",
      "MUY BUENO",
      "EXCELENTE",
    ],
  },
  servicio: {
    type: Number,
    maxlength: [2, " Cantidad servicio no debe exceder los 2 dìgitos."],
  },
  sanciones: {
    type: Number,
    maxlength: [2, " Cantidad sanciones no debe exceder los 2 dìgitos."],
  },
  gestora: {
    type: String,
    uppercase: true,
    enum: ["NO", "SI", "ACTUALIZAR"],
  },
  biometrico: {
    type: String,
    uppercase: true,
    maxlength: [100, "El biometrico no puede exceder los 50 caracteres."],
  },
  caja: [
    {
      type: String,
      uppercase: true,
    },
  ],
  registro: {
    type: String,
    uppercase: true,
    enum: ["NO", "RPA", "RAE"],
  },
  discapacidad: {
    type: String,
    uppercase: true,
    enum: ["NO", "SI"],
  },
  detalle: {
    type: String,
    uppercase: true,
    required: false,
  },
  id_funcionario: {
    type: mongoose.Schema.Types.ObjectId,
  },
});

module.exports = mongoose.model("Detalles", detallesSchema);
