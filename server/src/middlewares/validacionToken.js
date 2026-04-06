require("dotenv").config();
const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET;

function verificarToken(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(403).send("Acceso Denegado!.");
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).send("Acceso no autorizado!.");
  }
}

module.exports = verificarToken;
