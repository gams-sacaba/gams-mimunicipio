// config.js
const mongoose = require("mongoose");
require("dotenv").config();

async function conexion() {
  try {
    await mongoose.connect(process.env.URL_DATABASE);
    console.log("Conexion DB exitosa!");
  } catch (error) {
    console.log("Error conexion DB: ", error);
  }
}

module.exports = {
  conexion,
};
