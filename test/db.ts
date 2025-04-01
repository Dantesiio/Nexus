import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { ConnectOptions } from 'mongoose';

let mongoServer: MongoMemoryServer;

const connect = async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { } as ConnectOptions); // Elimina las opciones innecesarias
};

const clear = async () => {
  await mongoose.connection.dropDatabase();
};

const close = async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
};

export default { connect, clear, close };