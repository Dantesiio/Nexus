import express from "express";
import bodyParser from 'body-parser';
import { connectionDB } from "./lib/connectionDB";
import dotoenv from "dotenv";
import userRoutes from "./routes/user.route"; // Import userRoutes from the appropriate file

async function start() {

  dotoenv.config({
    path: "./.env",
  });


  console.log("🟡 Iniciando conexión a MongoDB...");

  await connectionDB()
    .then(() => console.log("✅ Conexión a MongoDB exitosa"))
    .catch((error) => {
      console.error("❌ Error al conectar a MongoDB:", error);
      process.exit(1);
    });
const app = express();


app.use(express.json());
app.use(bodyParser.json()); // Asegura que Express pueda leer JSON
app.use('/api', userRoutes); // Agrega las rutas al servidor

app.get('/', (_req: express.Request, res: express.Response) => {
  res.send("Hello World");
});


app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);



})}

start();