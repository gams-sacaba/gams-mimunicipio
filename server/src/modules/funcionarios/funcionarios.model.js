import mongoose from "mongoose";

const funcionarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, "El nombre es requerido."],
    uppercase: true,
    maxlength: [20, "El nombre no puede exceder los 20 caracteres."],
  },
  paterno: {
    type: String,

    uppercase: true,
    maxlength: [20, "El apellido paterno no puede exceder los 20 caracteres."],
  },
  materno: {
    type: String,
    uppercase: true,
    maxlength: [20, "El apellido materno no puede exceder los 20 caracteres."],
  },
  casada: {
    type: String,
    uppercase: true,
    maxlength: [
      50,
      "El apellido de casada no puede exceder los 50 caracteres.",
    ],
  },
  ci: {
    type: Number,
    required: [true, " El carnet de identidad es requerido."],
    maxlength: [
      10,
      "El carnet de identidad no puede exceder los 10 caracteres.",
    ],
  },
  ext: {
    type: String,
    uppercase: true,
    maxlength: [2, "La extensión no puede exceder los 2 caracteres."],
  },

  genero: {
    type: String,
    required: [true, "El género es requerido."],
    uppercase: true,
    enum: ["M", "F"],
  },
  estado_civil: {
    type: String,
    uppercase: true,
    default: "S",
    enum: ["S", "C", "D"],
  },
  fecha_nacimiento: {
    type: Date,
    required: [true, "Fecha de nacimiento es requerido."],
  },
  telefono: {
    type: Number,
    maxlength: [10, "El número de teléfono no debe exceder las 10 cifras."],
    required: false,
  },

  domicilio: {
    distrito: {
      type: String,
      uppercase: true,
      maxlength: [50, "El distrito no puede exceder los 50 caracteres."],
      required: false,
    },
    zona: {
      type: String,
      uppercase: true,
      maxlength: [50, "La zona no puede exceder los 50 caracteres."],
      required: false,
    },
    pasaje: {
      type: String,
      uppercase: true,
      maxlength: [50, "El pasaje no puede exceder los 50 caracteres."],
      required: false,
    },
    calle: {
      type: String,
      uppercase: true,
      maxlength: [50, "La calle no puede exceder los 50 caracteres."],
      required: false,
    },
    numero_casa: {
      type: Number,
      maxlength: [5, "El numero de casa no puede exceder los 5 dígitos."],
      required: false,
    },
  },
  estado: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  password: { type: String, required: false },
  role: [
    {
      acceso: Number,
      nivel: String,
      modules: {
        type: Map,
        of: [String],
        default: {},
      },
    },
  ],
  tokenVersion: { type: Number, default: 0 },
});

funcionarioSchema.index({ nombre: 1, apellido_pa: 1, ci: 1, ext: 1 });

export default mongoose.model("Funcionarios", funcionarioSchema);
