import mongoose from "mongoose";
const partidaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, "El nombre es requerido."],
    uppercase: true,
    maxlength: [100, "En nombre no puede exceder los 100 caracteres."],
  },

  codigo: {
    type: Number,
    required: [true, "El código es obligatorio."],
    maxlength: [8, "El código no debe contener mas de 8 dígitos."],
  },
  fuente: {
    type: Number,
    required: [true, "La fuente es requerida."],
    maxlength: [3, "La fuente debe contener como máximo 3 dígitos."],
  },
  organismo: {
    type: Number,
    required: [true, "El organismo es requerido."],
    maxlength: [4, "El organismo debe contener como máximo 4 dígitos."],
  },
  monto_asignado: {
    type: Number,
    require: [true, "El monto asignado es obligatorio."],
  },
  monto_refuerzo: {
    type: Number,
  },
  tipo: {
    type: String,
    uppercase: true,
    maxlength: [50, "El tipo de gasto no debe exceder los 50 caracteres."],
  },
  asignacion: {
    type: String,
    required: [true, "El tipo es requerido."],
    uppercase: true,
    enum: ["ITEM", "EVENTUAL", "CONSULTOR"],
  },
  estado: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

partidaSchema.index({ codigo: 1 });

export default mongoose.model("Partidas", partidaSchema);
