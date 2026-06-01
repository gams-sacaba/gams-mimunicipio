import { conexion } from "./db.config.js";
import { Server } from "socket.io";
import { setupSocketHandlers } from "./sockets.config.js";
import cronService from "../services/cron.service.js";
import settingsService from "../../modules/settings/settings.service.js";

export function configureSockets(server) {
  const io = new Server(server, {
    cors: { origin: true, credentials: true },
  });

  global.io = io;
  setupSocketHandlers(io);
  return io;
}

export async function startServer(server, port) {
  try {
    await conexion();
    await settingsService.init();
    cronService.init();

    server.listen(port, () => {
      console.log(`--- MiMunicipio (G.A.M. Sacaba) ---`);
      console.log(`Servidor activo en puerto: ${port}`);
    });
  } catch (error) {
    console.error("Fallo catastrófico al iniciar:", error.message);
    process.exit(1);
  }
}
