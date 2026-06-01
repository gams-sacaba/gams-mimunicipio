import QrService from "./qrs.service.js";

class QrController {
  async validarQr(req, res) {
    const { codigoHash } = req.params;

    if (!codigoHash || !codigoHash.includes("_")) {
      return res
        .status(200)
        .json({ valido: false, message: "FORMATO_QR_INVALIDO" });
    }

    const [codigo, hash] = codigoHash.split("_");

    try {
      const result = await QrService.mostrarQr(codigo, hash);
      res.json(result);
    } catch (error) {
      console.error("Error al validar QR:", error.message);
      res.status(200).json({
        valido: false,
        message: error.message || "ERROR_AL_OBTENER_DATOS_DE_VERIFICACION",
      });
    }
  }
}

export default new QrController();
