import mongoose from "mongoose";
import "dotenv/config";

export async function conexion() {
  try {
    await mongoose.connect(process.env.URL_DATABASE);

    console.log("Conexión DB exitosa!");
    return true;
  } catch (error) {
    console.error("Error conexión DB: ", error.message);
    return false;
  }
}

export default {
  conexion,
};
