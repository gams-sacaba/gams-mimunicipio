const mongoose = require("mongoose");

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
  // Restricciones embebidas
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
    limite_dias: { type: Number, min: 0.5, default: 0.5 }, //recibe como valor minimo 0.5 que implica medio dia.
    //Determina los dias alrededor del tiempo establecido para generar la solicitud, ejemplo: excepcion de tickeos tiene 24 horas a partir del no tickeo en biometrico, una vez vence el plazo se considera descuento
    max_dias_plazo: { type: Number, min: 0, default: 0 },
    //Determina con cuantos dias de anticipacion puede solicitar
    max_dias_anticipacion: { type: Number, min: 0, default: 0 },
    //restricciones para seleccion de calendario
    max_dias_semana: { type: Number, default: 7 }, //cuantos dias como maximo puede tomar en semana
    max_dias_mes: { type: Number, default: 31 }, //cuantos dias como maximo puede tomar al mes
    max_dias_anio: { type: Number, default: 360 }, //cuantos dias como maximo puede tomar al año
    dias_no_permitidos: {
      //dias especificos a nivel general que se aplicara en el calendario para bloquear la seleccion
      type: [Number], // 0=Domingo, 6=Sábado
      default: [],
    },
    fechas_no_permitidas: {
      //implica un rango de fechas que se aplicara en el calendario para bloquear la seleccion
      type: [
        {
          inicio: { type: Date, required: true },
          fin: { type: Date, required: true },
        },
      ],
      default: [],
    },
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

module.exports = mongoose.model("Contenidos", contenidoSchema);
