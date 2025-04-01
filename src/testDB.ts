import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import User from "./models/user.model"; // Asegúrate de que la ruta sea correcta
import dotenv from "dotenv";

dotenv.config(); // Cargar variables de entorno

const MONGO_URI = "mongodb://root:example@localhost:28017/usuariosDB?authSource=admin"; // Cambia según tu configuración

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Conexión a MongoDB exitosa");

    const userCount = await User.countDocuments({});
    console.log(`📌 Número total de usuarios en la base de datos: ${userCount}`);

    const user = await User.findOne({ correo: "regular@ejemplo.com" }).select("+contraseña");
    console.log("🔍 Usuario encontrado:", user);

    if (user) {
      console.log("🔑 Contraseña en BD:", user.contraseña);
      console.log("📂 Tipo de dato de contraseña:", typeof user.contraseña);

      // Generar Token JWT
      
      const secretKey = process.env.JWT_SECRET ?? "prueba"; // Clave secreta (NO usar en producción)
      const token = jwt.sign(
        {
          id: user._id,
          nombre: user.nombre,
          correo: user.correo,
          rol: user.rol
        },
        secretKey,
        { expiresIn: "24h" }
      );

      console.log("✅ Token generado:");
      console.log(token);
    } else {
      console.log("⚠️ Usuario no encontrado en la base de datos.");
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error al conectar a MongoDB:", error);
  }
})();
