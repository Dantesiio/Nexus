import mongoose from 'mongoose';

const mongoUri = process.env.DB_URI || 'mongodb://root:example@localhost:28017/usuariosDB?authSource=admin';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) { // Verifica si no hay conexión activa
    await mongoose.connect(mongoUri);
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});
