import "dotenv/config";
import jwt from "jsonwebtoken";
import User from "../funcionarios/funcionarios.model.js";

const secretKey = process.env.JWT_SECRET;
const accessCodeSecret = process.env.ACCESS_CODE_MIMUNICIPIO;

export async function authMiddleware(req, res, next) {
  const accessCode = req.headers["x-access-code"];

  if (accessCode && accessCode === accessCodeSecret) {
    console.log("[Auth] Acceso concedido vía x-access-code (Servicio Interno)");
    return next();
  }

  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res
      .status(401)
      .json({ success: false, message: "No token or code provided" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ success: false, message: "Token inválido" });
  }

  try {
    const payload = jwt.verify(token, secretKey);
    const user = await User.findById(payload._id);

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Usuario no encontrado" });
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      return res.status(401).json({
        success: false,
        message: "Token expirado.",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Token inválido o caducado" });
  }
}

export default {
  authMiddleware,
};
