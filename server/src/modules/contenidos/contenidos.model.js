import mongoose from "mongoose";

const contenidoSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, "El título es requerido."],
    maxlength: [50, "El título no debe exceder los 50 caracteres."],
    uppercase: true,
    trim: true,
  },
  encabezado: {
    type: String,
    required: [true, "El encabezado es requerido."],
    maxlength: [50, "El encabezado no debe exceder los 50 caracteres."],
    uppercase: true,
    trim: true,
  },
  denominacion: {
    type: String,
    required: [true, "La denominación es requerida."],
    maxlength: [5, "La denominación no debe exceder los 5 caracteres."],
    uppercase: true,
    trim: true,
  },
  categoria: {
    type: String,
    uppercase: true,
    enum: ["HORA", "FECHA", "RANGO", "CALENDARIO"],
    required: [true, "La categoría es requerida."],
  },

  restricciones: {
    contratos: {
      type: [String],
      uppercase: true,
      enum: ["ITEM", "EVENTUAL", "REMANENTE", "CONSULTOR"],
      default: [],
    },
    reemplazo: { type: Boolean, default: true },
    genero: { type: [String], enum: ["M", "F"], default: [] },
    hijos: { type: [String], enum: ["S", "C"], default: [] },
    estado_civil: {
      type: [String],
      uppercase: true,
      enum: ["S", "C", "D"],
      default: [],
    },
    limite_dias: { type: Number, min: 0.5, default: 0.5 },
    max_dias_plazo: { type: Number, min: 0, default: 0 },

    max_dias_anticipacion: { type: Number, min: 0, default: 0 },

    max_dias_semana: { type: Number, default: 7 },
    max_dias_mes: { type: Number, default: 31 },
    max_dias_anio: { type: Number, default: 360 },
    dias_no_permitidos: {
      type: [Number],
      default: [],
    },
    fechas_no_permitidas: {
      type: [
        {
          inicio: { type: Date, required: true },
          fin: { type: Date, required: true },
        },
      ],
      default: [],
    },
    cierre_administrativo: { type: Number, min: 0, default: 0 },
  },
  detalle: { type: Boolean, default: false },
  descripcion: {
    type: String,
    required: [true, "La descripción es requerida."],
    maxlength: [150, "La descripción no debe exceder los 150 caracteres."],
    uppercase: true,
    trim: true,
  },
  orden: {
    type: Number,
    min: 0,
    default: 0,
  },
  estado: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

contenidoSchema.index({ denominacion: 1, estado: 1 }, { unique: true });

export default mongoose.model("Contenidos", contenidoSchema);
