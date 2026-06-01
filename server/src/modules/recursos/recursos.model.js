import mongoose from "mongoose";

const RecursoSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    descripcion: { type: String, trim: true },

    tipoDocumento: {
      type: String,
      required: true,
      uppercase: true,
      index: true,
    },
    formato: {
      type: String,
      enum: ["DOCUMENTO", "IMAGEN", "VIDEO", "URL", "OTRO"],
      required: true,
    },

    archivo: {
      path: { type: String, default: "" },
      url_externa: { type: String, trim: true },
      nombreOriginal: String,
      extension: { type: String, lowercase: true },
      mimetype: String,
      tamano: Number,
      checksum: String,
    },
    filtros: {
      id_funcionario: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Funcionarios",
        index: true,
      },
      id_cargo: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Cargos",
        index: true,
      },
      id_dependencia: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Dependencias",
        index: true,
      },
      acceso_sistema: { type: [Number], index: true },
      id_nivel_salarial: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Niveles",
        index: true,
      },
      tipo_contrato: {
        type: [String],
        uppercase: true,
        enum: ["ITEM", "EVENTUAL", "REMANENTE", "CONSULTOR"],
        index: true,
      },
    },
    control_qr: {
      requiere_qr: { type: Boolean, default: false },
      id_qr: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Qrs",
        index: true,
      },
      url_destino: { type: String },
    },
    metadata: {
      id_usuario_subida: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Funcionarios",
        required: true,
      },
      fechaPublicacion: { type: Date, default: Date.now },
      fechaExpiracion: { type: Date },
      descargas: { type: Number, default: 0 },
      version: { type: Number, default: 1 },
      activo: { type: Boolean, default: true, index: true },
      tags: [String],
    },
  },
  { timestamps: true },
);

RecursoSchema.index({ "metadata.activo": 1, tipoAcceso: 1, tipoDocumento: 1 });

export default mongoose.model("Recursos", RecursoSchema);
