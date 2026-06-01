import rateLimit from "express-rate-limit";

const globalMessage =
  "Demasiadas solicitudes de esta IP, intente nuevamente en 5 minutos.";
const loginMessage =
  "Demasiados intentos de inicio de sesion, intente nuevamente en 5 minutos.";

export const globalRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5000000000000,
  handler: (req, res) => {
    res.status(429).json({ message: globalMessage });
  },
});

export const loginRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5000000000000,
  keyGenerator: (req) => {
    const ip = req.ip;
    const user = req.body.username || "anon";
    return `${ip}-${user}`;
  },
  handler: (req, res) => {
    res.status(429).json({ message: loginMessage });
  },
});

export default { globalRateLimit, loginRateLimit };
