const mongoose = require("mongoose");

const dependenciaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, "El nombre es obligatorio"],
    uppercase: true,
    maxlength: [150, "El nombre no puede exceder los 150 caracteres"],
  },
  sigla: {
    type: String,
    required: [true, "La sigla es obligatoria"],
    uppercase: true,
    maxlength: [10, "La sigla no puede exceder los 10 caracteres"],
    unique: true,
  },
  tipo: {
    type: String,
    enum: ["JEFATURA", "DIRECCION", "SECRETARIA"],
    required: [true, "El tipo es obligatorio"],
  },
  estado: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  id_dependencia: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Dependencias",
  },
});

dependenciaSchema.index({ nombre: 1, sigla: 1 });

module.exports = mongoose.model("Dependencias", dependenciaSchema);
