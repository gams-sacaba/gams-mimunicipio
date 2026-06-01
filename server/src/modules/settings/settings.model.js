import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  redireccion_aprobador: [
    {
      id_aprobador_origen: {
        type: mongoose.Types.ObjectId,
        ref: "Registros",
      },
      id_aprobador_destino: {
        type: mongoose.Types.ObjectId,
        ref: "Registros",
      },
      descripcion: { type: String, maxlength: 150 },
      fecha: { type: Date, default: Date.now },
      estado: {
        type: Boolean,
        default: true,
      },
    },
  ],
  programacion_mantenimiento: [
    {
      dias: {
        type: [Number],
        default: [0],
      },
      horas: {
        type: [String],
        default: ["00:00"],
      },
      descripcion: { type: String },
      activo: { type: Boolean, default: true },
    },
  ],
  solicitud_config: [
    {
      id_aprobador_final: {
        type: mongoose.Types.ObjectId,
        ref: "Cargos",
      },
      redireccion_aprobador: [
        {
          id_aprobador_origen: {
            type: mongoose.Types.ObjectId,
            ref: "Registros",
          },
          id_aprobador_destino: {
            type: mongoose.Types.ObjectId,
            ref: "Registros",
          },
          descripcion: { type: String, maxlength: 150 },
          fecha: { type: Date, default: Date.now },
          estado: {
            type: Boolean,
            default: true,
          },
        },
      ],
      activo: { type: Boolean, default: true },
    },
  ],
  recurso_config: [
    {
      categoria: {
        type: [String],
        uppercase: true,
        required: true,
        default: ["GENERAL"],
      },
      categoria_default: {
        type: String,
        uppercase: true,
        required: true,
        default: "GENERAL",
      },
      activo: { type: Boolean, default: true },
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

export default mongoose.model("Settings", settingsSchema);
