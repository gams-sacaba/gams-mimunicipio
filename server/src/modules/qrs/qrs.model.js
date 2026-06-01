import mongoose from "mongoose";

const QrSchema = new mongoose.Schema(
  {
    codigo_unico: { type: String, unique: true, required: true },
    url_destino: { type: String, required: true },
    tipo: {
      type: String,
      required: true,
      uppercase: true,
      enum: [
        "FUNCIONARIO",
        "DEPENDENCIA",
        "NIVEL",
        "CARGO",
        "ACCESO",
        "GENERAL",
      ],
    },

    descripcion: String,

    informacion_legal: {
      type: [String],
      required: true,
      uppercase: true,
      default: [],
    },

    diseno: {
      posicionX: { type: Number, required: true },
      posicionY: { type: Number, required: true },
      mostrar_texto_legal: { type: Boolean, default: true },
      tamano_px: { type: Number, default: 100 },
    },

    uso: {
      contador: { type: Number, default: 0 },
      ultima_lectura: Date,
    },

    activo: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model("Qrs", QrSchema);
