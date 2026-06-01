import mongoose from "mongoose";

const rotacionSchema = new mongoose.Schema({
  fecha_ingreso: {
    type: Date,
    required: [true, "Fecha de ingreso es requerido."],
  },
  fecha_conclusion: {
    type: Date,
    required: [true, "Fecha de conclusión es requerido."],
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
  id_registro: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Registros",
    required: [true, "El ID de registro es requerido."],
  },
  id_cargo_rotacion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cargos",
    required: [true, "El ID del cargo es requerido."],
  },
});

rotacionSchema.index({ id_registro: 1, id_cargo_rotacion: 1 });

export default mongoose.model("Rotaciones", rotacionSchema);
