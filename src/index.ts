// src/index.ts
import express, { Application, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';

// Importar rutas
import userRoutes from './routes/user.route';
// Importar otros módulos de rutas aquí

// Importar middleware de error
import { errorHandler } from './middlewares/errorHandler';
// Configurar variables de entorno
dotenv.config();

// Crear aplicación Express
const app: Application = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('dev'));

// Rutas
app.use('/api', userRoutes);
// Agregar otros módulos de rutas aquí

// Ruta de prueba
app.get('/', (_req: Request, res: Response) => {
  res.send('API en funcionamiento');
});

// Middleware de manejo de errores
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  errorHandler(err, _req, res, _next);
});

// Conectar a MongoDB
const DB_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/app_db';

mongoose
  .connect(DB_URI)
  .then(() => {
    console.log('Conexión a MongoDB establecida');
    
    // Iniciar servidor
    const PORT = process.env.PORT ?? 3000;
    app.listen(PORT, () => {
      console.log(`Servidor ejecutándose en puerto ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error al conectar a MongoDB:', err);
    process.exit(1);
  });

// Manejar errores de conexión después de la conexión inicial
mongoose.connection.on('error', err => {
  console.error('Error de conexión MongoDB:', err);
});

export default app;