import mongoose from "mongoose";

const solicitudSchema = new mongoose.Schema({
  dias: [
    {
      fecha: { type: Date, required: true },
      jornada: { type: String, enum: ["completa", "media"], required: true },
      turno: { type: String, enum: ["mañana", "tarde", ""], default: "" },
    },
  ],
  gestion: { type: Date, default: Date.now, required: true },
  dias_totales: { type: Number, required: true },
  fecha_envio: { type: Date, default: Date.now },
  fecha_inicio: { type: Date, required: true },
  fecha_fin: { type: Date, required: true },
  hora_inicio: { type: String, maxlength: 150 },
  hora_fin: { type: String, maxlength: 150 },
  detalle: { type: String, maxlength: 150, required: false },
  observacion: { type: String, maxlength: 150 },
  reemplazo: {
    type: mongoose.Types.ObjectId,
    ref: "Registros",
    required: false,
  },
  id_registro: {
    type: mongoose.Types.ObjectId,
    ref: "Registros",
    required: true,
  },
  id_contenido: {
    type: mongoose.Types.ObjectId,
    ref: "Contenidos",
    required: true,
  },
  id_cargo_aprobador: {
    type: mongoose.Types.ObjectId,
    ref: "Cargos",
    required: true,
  },
  historial_aprobacion: [
    {
      id_registro: {
        type: mongoose.Types.ObjectId,
        ref: "Registros",
      },
      decision: {
        type: String,
        enum: [
          "CANCELADO",
          "ENVIADO",
          "PENDIENTE",
          "APROBADO",
          "DENEGADO",
          "RECHAZADO",
          "ANULADO",
          "VENCIDO",
        ],
      },
      fecha: { type: Date, default: Date.now },
    },
  ],
  estado: {
    type: String,
    enum: [
      "CANCELADO",
      "ENVIADO",
      "PENDIENTE",
      "APROBADO",
      "DENEGADO",
      "RECHAZADO",
      "ANULADO",
      "VENCIDO",
    ],
    default: "ENVIADO",
  },
});

solicitudSchema.index({ id_registro: 1, estado: 1 });

export default mongoose.model("Solicitudes", solicitudSchema);
