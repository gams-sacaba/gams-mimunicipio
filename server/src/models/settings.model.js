//settings.model.js

const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  redireccion_aprobador: [
    {
      id_aprobador_origen: {
        type: mongoose.Types.ObjectId,
        ref: "Registros",
      }, // cargo aprobador
      id_aprobador_destino: {
        type: mongoose.Types.ObjectId,
        ref: "Registros",
      }, // cargo redireccion
      descripcion: { type: String, maxlength: 150 },
      fecha: { type: Date, default: Date.now },
      estado: {
        type: Boolean,
        default: true,
      },
    },
  ],
  estado: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

settingsSchema.index({ id_aprobador_origen: 1, id_aprobador_destino: 1 });

module.exports = mongoose.model("Settings", settingsSchema);
