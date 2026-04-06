const jwt = require("jsonwebtoken");
const User = require("../models/funcionarios.model");

const secretKey = process.env.JWT_SECRET;

async function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
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
      return res
        .status(401)
        .json({ success: false, message: "Token expirado" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Token inválido o caducado" });
  }
}

module.exports = authMiddleware;
