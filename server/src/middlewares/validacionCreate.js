const { validarCampo } = require("./validacion");
const Funcionario = require("../models/funcionarios.model");

function validarUsuario(requerido = true, actualizar = false) {
  return [];
}

function validarFuncionario(requerido = true, actualizar = false) {
  return [
    validarCampo("nombre", { requerido, longitudMaxima: 20 }),
    validarCampo("paterno", { requerido: false, longitudMaxima: 20 }),
    validarCampo("materno", { requerido: false, longitudMaxima: 20 }),
    validarCampo("casada", { requerido: false, longitudMaxima: 50 }),
    validarCampo("ci", {
      requerido,
      tipoEntero: true,
      minNumero: 1000,
      longitudMaxima: 10,
      existeCI: Funcionario,
      actualizar,
    }),
    validarCampo("ext", {
      requerido: false,
      longitudMinima: 1,
      longitudMaxima: 2,
    }),
    // validarCampo("expedido", {
    //   requerido: false,
    //   lista: ["LP", "SC", "CB", "PT", "OR", "TJ", "CH", "BN", "PA"],
    // }),
    validarCampo("genero", { requerido, lista: ["M", "F"] }),
    validarCampo("fecha_nacimiento", { requerido, formatoFecha: true }),
    validarCampo("telefono", {
      requerido: false,
      tipoEntero: true,
      minNumero: 1000000,
      longitudMaxima: 10,
    }),
    validarCampo("correo", {
      requerido: false,
      tipoEmail: true,
      longitudMaxima: 35,
    }),
    validarCampo("domicilio.distrito", {
      requerido: false,
      longitudMaxima: 50,
    }),
    validarCampo("domicilio.zona", { requerido: false, longitudMaxima: 50 }),
    validarCampo("domicilio.pasaje", { requerido: false, longitudMaxima: 50 }),
    validarCampo("domicilio.calle", { requerido: false, longitudMaxima: 50 }),
    validarCampo("domicilio.numero_casa", {
      requerido: false,
      tipoEntero: true,
      //minNumero: 1,
      longitudMaxima: 5,
    }),
    // validarCampo("domicilio.telefono_casa", {
    //   requerido: false,
    //   tipoEntero: true,
    //   minNumero: 1111111,
    //   longitudMaxima: 10,
    // }),
    validarCampo("estado", { requerido: false, tipoBooleano: true }),
    validarCampo("password", { requerido: false }),
    validarCampo("role", { requerido: false }),
  ];
}

function validarDetalle(requerido = true, actualizar = false) {
  return [
    validarCampo("titulo", { requerido: false, longitudMaxima: 80 }),
    validarCampo("grado", {
      requerido,
      lista: [
        "NINGUNO",
        "TECNICO BASICO",
        "TECNICO MEDIO",
        "TECNICO SUPERIOR",
        "LICENCIATURA",
      ],
    }),
    validarCampo("ficha", {
      requerido,
      lista: ["NO", "SI", "ACTUALIZAR"],
    }),
    validarCampo("egreso", {
      requerido,
      lista: ["NO", "SI", "ACTUALIZAR"],
    }),
    validarCampo("estudio", {
      requerido,
      lista: ["NO", "SI", "ACTUALIZAR"],
    }),
    validarCampo("diploma", {
      requerido,
      lista: ["NO", "SI", "ACTUALIZAR"],
    }),
    validarCampo("fotocopia", {
      requerido,
      lista: ["NO", "SI", "ACTUALIZAR"],
    }),
    validarCampo("documentos", { requerido: false }),
    validarCampo("ddjj", { requerido: false }),
    validarCampo("certificados", { requerido: false }),
    validarCampo("licencias", { requerido: false }),
    validarCampo("diplomados", { requerido: false }),
    validarCampo("experiencia", { requerido: false }),
    validarCampo("hijos", {
      requerido,
      tipoEntero: true,
      longitudMaxima: 2,
    }),
    validarCampo("padre", { requerido: false, longitudMaxima: 50 }),
    validarCampo("madre", { requerido: false, longitudMaxima: 50 }),
    validarCampo("evaluacion", {
      requerido,
      lista: [
        "NO",
        "DEFICIENTE",
        "INSATISFACTORIO",
        "BUENO",
        "MUY BUENO",
        "EXCELENTE",
      ],
    }),
    validarCampo("servicio", {
      requerido,
      tipoEntero: true,
      longitudMaxima: 2,
    }),
    validarCampo("sanciones", {
      requerido,
      tipoEntero: true,
      longitudMaxima: 2,
    }),
    validarCampo("gestora", {
      requerido,
      lista: ["NO", "SI", "ACTUALIZAR"],
    }),
    validarCampo("biometrico", {
      requerido: false,
      longitudMaxima: 100,
    }),
    validarCampo("caja", { requerido: false }),
    validarCampo("registro", {
      requerido,
      lista: ["NO", "RPA", "RAE"],
    }),
    validarCampo("discapacidad", {
      requerido,
      lista: ["NO", "SI"],
    }),
    validarCampo("detalle", {
      requerido: false,
      longitudMaxima: 150,
    }),
    validarCampo("id_funcionario", { requerido, tipoMongoId: true }),
  ];
}

function validarContenido(requerido = true, actualizar = false) {
  return [
    validarCampo("titulo", {
      requerido,
      longitudMaxima: 50,
    }),
    validarCampo("encabezado", {
      requerido,
      longitudMaxima: 50,
    }),
    validarCampo("denominacion", {
      requerido,
      longitudMaxima: 5,
    }),
    validarCampo("categoria", {
      requerido,
      lista: ["HORA", "FECHA", "RANGO", "CALENDARIO"],
    }),
    validarCampo("descripcion", {
      requerido,
      longitudMaxima: 150,
    }),
    validarCampo("detalle", {
      requerido: false,
      tipoBooleano: true,
    }),
    validarCampo("estado", {
      requerido: false,
      tipoBooleano: true,
    }),
    validarCampo("restricciones.contratos", {
      requerido: false,
      tipoArray: true,
      lista: ["ITEM", "EVENTUAL", "REMANENTE", "CONSULTOR"],
    }),
    validarCampo("restricciones.reemplazo", {
      requerido: false,
      tipoBooleano: true,
    }),
    validarCampo("restricciones.genero", {
      requerido: false,
      tipoArray: true,
      lista: ["M", "F"],
    }),
    validarCampo("restricciones.hijos", {
      requerido: false,
      tipoArray: true,
      lista: ["S", "C"],
    }),
    validarCampo("restricciones.estado_civil", {
      requerido: false,
      tipoArray: true,
      lista: ["S", "C", "D"],
    }),
    validarCampo("restricciones.limite_dias", {
      requerido: false,
      tipoNumero: true,
      minNumero: 0.5,
    }),
    validarCampo("restricciones.max_dias_plazo", {
      requerido: false,
      tipoNumero: true,
      minNumero: 0,
    }),
    validarCampo("restricciones.max_dias_anticipacion", {
      requerido: false,
      tipoNumero: true,
      minNumero: 0,
    }),
    validarCampo("restricciones.max_dias_semana", {
      requerido: false,
      tipoNumero: true,
      minNumero: 0,
    }),
    validarCampo("restricciones.max_dias_mes", {
      requerido: false,
      tipoNumero: true,
      minNumero: 0,
    }),
    validarCampo("restricciones.max_dias_anio", {
      requerido: false,
      tipoNumero: true,
      minNumero: 0,
    }),
    validarCampo("restricciones.dias_no_permitidos", {
      requerido: false,
      tipoArray: true,
    }),
    validarCampo("restricciones.fechas_no_permitidas", {
      requerido: false,
      tipoArray: true,
    }),
    validarCampo("restricciones.fechas_no_permitidas.*.inicio", {
      requerido: false,
      formatoFecha: true,
    }),
    validarCampo("restricciones.fechas_no_permitidas.*.fin", {
      requerido: false,
      formatoFecha: true,
    }),
    validarCampo("orden", {
      requerido: false,
      tipoNumero: true,
      minNumero: 0,
    }),
  ];
}

function validarSolicitud(requerido = true, actualizar = false) {
  return [
    validarCampo("dias", {
      requerido,
      //tipoArray: true,
    }),
    validarCampo("gestion", {
      requerido,
      formatoFecha: true,
    }),
    validarCampo("dias_totales", {
      requerido,
      tipoNumero: true,
      minNumero: 0,
    }),
    validarCampo("fecha_envio", {
      requerido: false,
      formatoFecha: true,
    }),
    validarCampo("fecha_inicio", {
      requerido,
      formatoFecha: true,
    }),
    validarCampo("fecha_fin", {
      requerido,
      formatoFecha: true,
    }),
    validarCampo("hora_inicio", {
      longitudMaxima: 30,
    }),
    validarCampo("hora_fin", {
      longitudMaxima: 30,
    }),
    validarCampo("detalle", {
      longitudMaxima: 150,
    }),
    validarCampo("observacion", {
      longitudMaxima: 150,
    }),
    validarCampo("reemplazo", {
      requerido: false,
      tipoMongoId: true,
    }),
    validarCampo("id_registro", {
      requerido,
      tipoMongoId: true,
      //existeEnBD: Registro,
    }),
    validarCampo("id_contenido", {
      requerido,
      tipoMongoId: true,
      //existeEnBD: Contenido,
    }),
    validarCampo("id_cargo_aprobador", {
      requerido,
      tipoMongoId: true,
      //existeEnBD: Cargo,
    }),
    validarCampo("historial_aprobacion", {
      requerido: false,
      tipoArray: true,
    }),
    validarCampo("estado", {
      requerido: false,
      lista: [
        "CANCELADO",
        "ENVIADO",
        "PENDIENTE",
        "APROBADO",
        "DENEGADO",
        "RECHAZADO",
        "VENCIDO",
      ],
    }),
  ];
}

function validarBandeja(requerido = true, actualizar = false) {
  return [];
}

function validarUnidad(requerido = true, actualizar = false) {
  return [];
}

function validarDependencia(requerido = true, actualizar = false) {
  return [];
}

function validarSettings(requerido = true, actualizar = false) {
  return [];
}

module.exports = {
  validarUsuario,
  validarFuncionario,
  validarDetalle,
  validarContenido,
  validarSolicitud,
  validarBandeja,
  validarUnidad,
  validarDependencia,
  validarSettings,
};
