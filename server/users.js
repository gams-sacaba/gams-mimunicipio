require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const path = require("path");
const database = require("./src/database/config");
const settingsService = require("./src/services/settings.service");
const { setupSocketHandlers } = require("./src/config/sockets");

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: { origin: true, credentials: true },
});
global.io = io;

const routes = require("./src/routes/router");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: true,
    saveUninitialized: true,
  }),
);
app.set("trust proxy", true);

database.conexion();
settingsService.init();
app.use(express.static(path.join(__dirname, "../client")));
app.use(routes);
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client", "index.html"));
});

setupSocketHandlers(io);

const PORT = process.env.PORT || 3330;
server.listen(PORT, () => {
  console.log("Servidor activo en puerto ", PORT);
});
