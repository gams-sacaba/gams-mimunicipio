//solicitudes.controller.js
const Solicitud = require("../models/solicitudes.model");
const controller = require("./controller");
const { notifySolicitudUpdate } = require("../config/sockets");

const mongoose = require("mongoose");

const referencia = ["id_registro"];

async function getElementos(req, res) {
  await controller.getAll(Solicitud, req, res, "solicitudes");
}

async function getElemento(req, res) {
  await controller.getById(Solicitud, req, res, "Solicitud", referencia);
}

async function createElemento(req, res) {
  const nuevaSolicitud = await controller.create(
    Solicitud,
    req,
    res,
    "Solicitud"
  );

  if (nuevaSolicitud && (res.statusCode === 200 || res.statusCode === 201)) {
    try {
      const solicitudConDatos = await Solicitud.findById(nuevaSolicitud._id)
        .populate({
          path: "id_registro",
          populate: {
            path: "id_funcionario",
          },
        })
        .populate({
          path: "id_contenido",
        });

      if (
        solicitudConDatos &&
        solicitudConDatos.id_registro &&
        solicitudConDatos.id_registro.id_funcionario
      ) {
        const funcionarioId = solicitudConDatos.id_registro.id_funcionario._id;

        // console.log(
        //   `Notificando creación de solicitud ${solicitudConDatos} al funcionario ${funcionarioId}`
        // );
        notifySolicitudUpdate(global.io, funcionarioId, solicitudConDatos);
      }
    } catch (err) {
      console.error("Error al buscar la nueva solicitud para notificar:", err);
    }
  }
}

// async function createElemento(req, res) {
//   await controller.create(Solicitud, req, res, "Solicitud");

//   if (res.statusCode === 200 || res.statusCode === 201) {
//     if (req.body.id_registro) {
//       try {
//         const nuevaSolicitud = await Solicitud.findOne()
//           .sort({ createdAt: -1 })
//           .populate({
//             path: "id_registro",
//             populate: {
//               path: "id_funcionario",
//             },
//           });

//         if (
//           nuevaSolicitud &&
//           nuevaSolicitud.id_registro &&
//           nuevaSolicitud.id_registro.id_funcionario
//         ) {
//           const funcionarioId = nuevaSolicitud.id_registro.id_funcionario._id;
//           notifySolicitudUpdate(global.io, funcionarioId, nuevaSolicitud);
//         }
//       } catch (err) {
//         console.error(
//           "Error al buscar la nueva solicitud para notificar:",
//           err
//         );
//       }
//     }
//   }
// }

async function updateElemento(req, res) {
  await controller.update(Solicitud, req, res, "Solicitud");

  if (res.statusCode === 200) {
    const solicitudId = req.params.id;
    if (solicitudId) {
      try {
        const solicitudActualizada = await Solicitud.findById(solicitudId)
          .populate("id_contenido")
          .populate({
            path: "id_registro",
            populate: {
              path: "id_funcionario",
            },
          });

        if (
          solicitudActualizada &&
          solicitudActualizada.id_registro &&
          solicitudActualizada.id_registro.id_funcionario
        ) {
          const funcionarioId =
            solicitudActualizada.id_registro.id_funcionario._id;
          //   console.log(
          //     `Notificando actualizacion de solicitud ${solicitudActualizada} al funcionario ${funcionarioId}`
          //   );
          notifySolicitudUpdate(global.io, funcionarioId, solicitudActualizada);
        }
      } catch (err) {
        console.error(
          "Error al buscar la solicitud actualizada para notificar:",
          err
        );
      }
    }
  }
}

async function deleteElemento(req, res) {
  await controller.remove(Solicitud, req, res, "Solicitud");

  if (res.statusCode === 200) {
    const solicitudId = req.params.id;
    if (solicitudId) {
      try {
        const solicitudEliminada = await Solicitud.findById(
          solicitudId
        ).populate({
          path: "id_registro",
          populate: {
            path: "id_funcionario",
          },
        });

        if (
          solicitudEliminada &&
          solicitudEliminada.id_registro &&
          solicitudEliminada.id_registro.id_funcionario
        ) {
          const funcionarioId =
            solicitudEliminada.id_registro.id_funcionario._id;
          const payload = { _id: solicitudId, deleted: true };
          notifySolicitudUpdate(global.io, funcionarioId, payload);
        }
      } catch (err) {
        console.error(
          "Error al buscar la solicitud eliminada para notificar:",
          err
        );
      }
    }
  }
}

async function getCampoFiltrado(req, res) {
  try {
    const { campo, value } = req.params;
    console.log("Campo recibido:", campo, "Valor:", value);

    // Verificar que el campo exista en el esquema
    if (campo !== "id_cargo_aprobador") {
      return res.status(400).json({ error: "Campo no permitido" });
    }

    // Convertir  a ObjectId
    const objectId = new mongoose.Types.ObjectId(value);

    const solicitudes = await Solicitud.find({ id_cargo_aprobador: objectId })
      .populate("id_contenido")
      .populate({
        path: "id_registro",
        populate: [
          {
            path: "id_cargo",
            select: "nombre contrato",
          },
          {
            path: "id_funcionario",
            select: "nombre paterno materno casada ci",
          },
        ],
      })
      .sort({ _id: -1 })
      .lean();

    if (!solicitudes || solicitudes.length === 0) {
      console.log("No se encontraron resultados");
      return res.json([]);
    }

    res.json(solicitudes);
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

async function getElementoFiltrado(req, res) {}

module.exports = {
  getElementos,
  getElemento,
  createElemento,
  updateElemento,
  deleteElemento,
  getElementoFiltrado,
  getCampoFiltrado,
};
