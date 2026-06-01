import "dotenv/config";
import express from "express";
import http from "http";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import { configureAppMiddlewares } from "./src/core/config/middlewares.config.js";
import {
  startServer,
  configureSockets,
} from "./src/core/config/init.config.js";
import routes from "./src/shared/routes/router.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = http.createServer(app);

configureSockets(server);

configureAppMiddlewares(app);

const clientPath = path.resolve(__dirname, "../client");

app.use(express.static(clientPath));
app.use(routes);

app.get("*", (req, res) => {
  const indexPath = path.join(clientPath, "index.html");

  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send("Frontend no encontrado.");
  }
});

const PORT = process.env.PORT || 3330;
startServer(server, PORT);
