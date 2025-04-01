import mongoose from 'mongoose';
import User from '../src/models/user.model';
import UserService from '../src/services/user.service';
import { IUserInput, IUserUpdate } from '../src/interfaces/user.interface';
import { AppError } from '../src/lib/appError';
import { securityService } from '../src/services/security.service';

// Mock de securityService para evitar dependencias reales
jest.mock('../src/services/security.service', () => ({
  securityService: {
    comparePasswords: jest.fn(),
  },
}));

describe('UserService', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect('mongodb://localhost:27017/test', {});
    }
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const userData: IUserInput = {
        nombre: 'Juan Perez',
        correo: 'juan@test.com',
        contraseña: 'password123', // Más de 6 caracteres
      };

      const user = await UserService.createUser(userData);
      expect(user).toBeDefined();
      expect(user.nombre).toBe(userData.nombre);
      expect(user.correo).toBe(userData.correo);
      expect(user.estado).toBe(true);
    });

    it('should throw an error if email already exists', async () => {
      const userData: IUserInput = {
        nombre: 'Juan Perez',
        correo: 'juan@test.com',
        contraseña: 'password123', // Más de 6 caracteres
      };

      await UserService.createUser(userData);
      await expect(UserService.createUser(userData)).rejects.toThrow(
        new AppError('El correo ya está registrado', 400)
      );
    });
  });

  describe('getAllUsers', () => {
    it('should get all active users', async () => {
      await User.create([
        { nombre: 'User1', correo: 'user1@test.com', contraseña: 'password1', estado: true }, // Más de 6 caracteres
        { nombre: 'User2', correo: 'user2@test.com', contraseña: 'password2', estado: false }, // Más de 6 caracteres
      ]);

      const users = await UserService.getAllUsers();
      expect(users.length).toBe(1);
      expect(users[0].nombre).toBe('User1');
    });
  });

  describe('getUserById', () => {
    it('should get a user by ID', async () => {
      const newUser = await User.create({
        nombre: 'Maria Lopez',
        correo: 'maria@test.com',
        contraseña: 'password123', // Más de 6 caracteres
      });

      const user = await UserService.getUserById(newUser.id.toString());
      expect(user).toBeDefined();
      expect(user?.nombre).toBe('Maria Lopez');
    });

    it('should throw an error if user is not found or inactive', async () => {
      const inactiveUser = await User.create({
        nombre: 'Inactive User',
        correo: 'inactive@test.com',
        contraseña: 'password123', // Más de 6 caracteres
        estado: false,
      });

      await expect(UserService.getUserById(new mongoose.Types.ObjectId().toString())).rejects.toThrow(
        new AppError('Usuario no encontrado', 404)
      );
      await expect(UserService.getUserById(inactiveUser.id.toString())).rejects.toThrow(
        new AppError('Usuario no encontrado', 404)
      );
    });
  });

  describe('updateUser', () => {
    it('should update a user successfully', async () => {
      const newUser = await User.create({
        nombre: 'Pedro Gomez',
        correo: 'pedro@test.com',
        contraseña: 'password123', // Más de 6 caracteres
      });

      const updateData: IUserUpdate = { nombre: 'Pedro Updated' };
      const updatedUser = await UserService.updateUser(newUser.id.toString(), updateData);

      expect(updatedUser?.nombre).toBe('Pedro Updated');
    });

    it('should throw an error if email is already in use', async () => {
      await User.create([
        { nombre: 'User1', correo: 'user1@test.com', contraseña: 'password1' }, // Más de 6 caracteres
        { nombre: 'User2', correo: 'user2@test.com', contraseña: 'password2' }, // Más de 6 caracteres
      ]);

      const user1 = await User.findOne({ correo: 'user1@test.com' });
      const updateData: IUserUpdate = { correo: 'user2@test.com' };

      await expect(UserService.updateUser(user1!.id.toString(), updateData)).rejects.toThrow(
        new AppError('El correo ya está en uso por otro usuario', 400)
      );
    });
  });

  describe('deleteUser', () => {
    it('should soft delete a user successfully', async () => {
      const newUser = await User.create({
        nombre: 'Ana Torres',
        correo: 'ana@test.com',
        contraseña: 'password123', // Más de 6 caracteres
      });

      const deletedUser = await UserService.deleteUser(newUser.id.toString());
      expect(deletedUser?.estado).toBe(false);

      const userInDb = await User.findById(newUser.id);
      expect(userInDb?.estado).toBe(false);
    });

    it('should throw an error if user is not found', async () => {
      await expect(UserService.deleteUser(new mongoose.Types.ObjectId().toString())).rejects.toThrow(
        new AppError('Usuario no encontrado', 404)
      );
    });
  });

  describe('loginUser', () => {
    it('should login a user and return token', async () => {
      const userData: IUserInput = {
        nombre: 'Luis Garcia',
        correo: 'luis@test.com',
        contraseña: 'password123', // Más de 6 caracteres
      };

      await UserService.createUser(userData);
      (securityService.comparePasswords as jest.Mock).mockResolvedValue(true);

      const loginResponse = await UserService.loginUser('luis@test.com', 'password123');
      expect(loginResponse).toHaveProperty('usuario');
      expect(loginResponse).toHaveProperty('token');
      expect(loginResponse.usuario.nombre).toBe('Luis Garcia');
    });

    it('should throw an error for invalid credentials', async () => {
      await User.create({
        nombre: 'Luis Garcia',
        correo: 'luis@test.com',
        contraseña: 'password123', // Más de 6 caracteres
      });

      (securityService.comparePasswords as jest.Mock).mockResolvedValue(false);

      await expect(UserService.loginUser('luis@test.com', 'wrongpass')).rejects.toThrow(
        new AppError('Credenciales inválidas', 401)
      );

      await expect(UserService.loginUser('wrong@test.com', 'password123')).rejects.toThrow(
        new AppError('Credenciales inválidas', 401)
      );
    });
  });
});