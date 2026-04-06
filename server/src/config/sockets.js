require("dotenv").config();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/funcionarios.model");
const secretKey = process.env.JWT_SECRET;

const userSockets = new Map();

function addSocketForUser(userId, socket) {
  const key = String(userId);
  if (!userSockets.has(key)) userSockets.set(key, new Set());
  userSockets.get(key).add(socket.id);
}

function removeSocketForUser(userId, socket) {
  const key = String(userId);
  const s = userSockets.get(key);
  if (s) {
    s.delete(socket.id);
    if (s.size === 0) userSockets.delete(key);
  }
}

function forceLogoutUser(io, userId, reason = "estado_false") {
  const key = String(userId);
  const sockets = userSockets.get(key);
  if (!sockets) return;
  for (const socketId of Array.from(sockets)) {
    try {
      io.to(socketId).emit("forceLogout", { reason });
      const socketObj = io.sockets.sockets.get(socketId);
      if (socketObj) {
        socketObj.disconnect(true);
      }
    } catch (err) {
      console.error("Error disconnecting socket", socketId, err);
    }
  }
  userSockets.delete(key);
}

async function verifySocketToken(socket, next) {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("AUTH_MISSING"));
    const payload = jwt.verify(token, secretKey);

    const user = await User.findById(payload._id);
    if (!user) return next(new Error("USER_NOT_FOUND"));

    if (payload.tokenVersion !== user.tokenVersion) {
      return next(new Error("TOKEN_INVALIDATED"));
    }

    socket.user = { id: user._id.toString(), ci: user.ci };
    return next();
  } catch (err) {
    console.error("verifySocketToken error:", err.message || err);
    return next(new Error("AUTH_FAILED"));
  }
}

function startChangeStream(io) {
  const db = mongoose.connection;
  if (db.readyState !== 1) {
    console.warn("MongoDB no conectado: startChangeStream omitido");
    return;
  }

  try {
    const userColl = db.collection("funcionarios");
    const changeStream = userColl.watch(
      [{ $match: { operationType: { $in: ["update", "replace"] } } }],
      { fullDocument: "updateLookup" },
    );

    changeStream.on("change", (change) => {
      try {
        const full = change.fullDocument;
        if (full && full._id) {
          if (full.estado === false) {
            console.log("ChangeStream detectó estado false:", full._id);
            forceLogoutUser(io, full._id, "estado_false");
          }

          if (
            change.updateDescription?.updatedFields?.tokenVersion !== undefined
          ) {
            console.log(
              "ChangeStream detectó cambio de tokenVersion:",
              full._id,
            );
            forceLogoutUser(io, full._id, "token_invalidated");
          }
        }
      } catch (inner) {
        console.error("Error procesando changeStream change:", inner);
      }
    });

    changeStream.on("error", (err) => {
      console.error("ChangeStream error:", err);

      try {
        changeStream.close();
      } catch (e) {}
      setTimeout(() => startChangeStream(io), 5000);
    });
  } catch (err) {
    console.error("startChangeStream fallo:", err);
    setTimeout(() => startChangeStream(io), 5000);
  }
}

function startPolling(io, intervalMs = 15000) {
  setInterval(async () => {
    try {
      for (const userId of Array.from(userSockets.keys())) {
        const user = await User.findById(userId);
        if (user && user.estado === false) {
          console.log("Polling detectó usuario con estado false:", userId);
          forceLogoutUser(io, userId, "estado_false");
        }
      }
    } catch (err) {
      console.error("Polling error:", err);
    }
  }, intervalMs);
}

function setupSocketHandlers(io) {
  io.use((socket, next) => verifySocketToken(socket, next));

  io.on("connection", (socket) => {
    const userId = socket.user?.id;
    if (!userId) {
      socket.disconnect(true);
      return;
    }

    addSocketForUser(userId, socket);
    console.log(`Socket conectado: ${socket.id} user ${userId}`);

    socket.on("pingServer", () => socket.emit("pong", { time: Date.now() }));

    socket.on("disconnect", (reason) => {
      removeSocketForUser(userId, socket);
      console.log(
        `Socket desconectado: ${socket.id} user ${userId} reason: ${reason}`,
      );
    });
  });

  startChangeStream(io);

  startPolling(io, 15000);
}

function broadcastContenidoUpdate(io) {
  console.log(
    "Un contenido ha sido modificado. Notificando a todos los clientes.",
  );

  io.emit("contenidoUpdated", {
    message: "Los contenidos han sido actualizados. Por favor, recarga.",
  });
}

function notifySolicitudUpdateToUser(io, userId, solicitudData) {
  const key = String(userId);
  const sockets = userSockets.get(key);
  if (!sockets) {
    console.log(
      `Usuario ${userId} no está conectado. No se puede notificar la actualización de solicitud.`,
    );
    return;
  }

  console.log(
    `Notificando actualización de solicitud ${solicitudData._id} al usuario ${userId}.`,
  );
  for (const socketId of Array.from(sockets)) {
    try {
      io.to(socketId).emit("solicitudUpdatedToUser", solicitudData);
    } catch (err) {
      console.error(
        "Error emitiendo solicitudUpdatedToUser a socket",
        socketId,
        err,
      );
    }
  }
}

function notifySolicitudUpdatedToApprover(io, userId, solicitudData) {
  const key = String(userId);
  const sockets = userSockets.get(key);
  if (!sockets) {
    console.log(
      `Usuario aprobador ${userId} no está conectado. No se puede notificar la actualización de solicitud.`,
    );
    return;
  }

  console.log(
    `Notificando actualización de solicitud ${solicitudData._id} al usuario aprobador ${userId}.`,
  );
  for (const socketId of Array.from(sockets)) {
    try {
      io.to(socketId).emit("solicitudUpdatedToApprover", solicitudData);
    } catch (err) {
      console.error(
        "Error emitiendo solicitudUpdatedToApprover a socket",
        socketId,
        err,
      );
    }
  }
}
module.exports = {
  setupSocketHandlers,
  forceLogoutUser,
  userSockets,
  broadcastContenidoUpdate,
  notifySolicitudUpdateToUser,
  notifySolicitudUpdatedToApprover,
};
