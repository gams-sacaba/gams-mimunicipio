const mongoose = require("mongoose");

const registroSchema = new mongoose.Schema({
  tipo: {
    type: String,
    //required: [true, "El tipo de registro es requerido."],
    uppercase: true,
    enum: [
      "RENUNCIA",
      "ABANDONO",
      "CONCLUSION",
      "RESOLUCION",
      "ROTACION",
      "REASIGNACION",
      "ASCENSO",
      "AGRADECIMIENTO",
      "TRANSFERENCIA",
    ],
  },
  fecha_baja: {
    type: Date,
  },
  fecha_ingreso: {
    type: Date,
    required: [true, "Fecha de ingreso es requerido."],
  },
  fecha_conclusion: {
    type: Date,
    required: [true, "Fecha de conclusión es requerido."],
  },
  historico: [
    {
      id_cargo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cargos",
      },
      fecha_inicio: {
        type: Date,
        default: Date.now,
      },
      fecha_final: {
        type: Date,
      },
    },
  ],
  tipo_contrato: {
    type: String,
    uppercase: true,
    enum: ["MD", "MR", "MA", "MT", "CAPE"],
  },
  cite: {
    type: String,
    uppercase: true,
    maxlength: [50, "No debe exceder los 50 caracteres."],
  },
  numero_contrato: {
    type: String,
    uppercase: true,
    maxlength: [10, "No debe exceder los 10 caracteres."],
  },
  descripcion: {
    type: String,
    uppercase: true,
    maxlength: [100, "No debe exceder los 100 caracteres."],
  },
  estado: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  id_secretaria_contratante: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Registros",
  },
  id_funcionario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Funcionarios",
    required: [true, "El ID del funcionario es requerido."],
  },
  id_cargo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cargos",
    required: [true, "El ID del cargo es requerido."],
  },
});

module.exports = mongoose.model("Registros", registroSchema);
