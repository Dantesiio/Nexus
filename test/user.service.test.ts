import mongoose from 'mongoose';
import User from '../src/models/user.model';
import UserService from '../src/services/user.service';
import { IUserInput, IUserUpdate } from '../src/interfaces/user.interface';
import { AppError } from '../src/lib/appError';
import { securityService } from '../src/services/security.service';

// Mock de securityService para aislar las pruebas de dependencias externas
jest.mock('../src/services/security.service', () => ({
  securityService: {
    comparePasswords: jest.fn(), // Simula la comparación de contraseñas
  },
}));

// Suite de pruebas para el servicio UserService
describe('UserService', () => {
  // Configuración global: conecta a la base de datos antes de todas las pruebas
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect('mongodb://localhost:27017/test', {}); // Usa una base de datos de prueba
    }
  });

  // Limpieza global: desconecta de la base de datos después de todas las pruebas
  afterAll(async () => {
    await mongoose.disconnect(); // Cierra la conexión para evitar fugas
  });

  // Preparación antes de cada prueba: limpia la colección de usuarios
  beforeEach(async () => {
    await User.deleteMany({}); // Elimina todos los usuarios para un entorno limpio
  });

  // Pruebas para el método createUser
  describe('createUser', () => {
    it('should create a user successfully', async () => {
      // Datos válidos para crear un usuario
      const userData: IUserInput = {
        nombre: 'Juan Perez',
        correo: 'juan@test.com',
        contraseña: 'password123', // Cumple con la validación de longitud mínima
      };

      const user = await UserService.createUser(userData); // Crea el usuario
      expect(user).toBeDefined(); // Verifica que se haya creado
      expect(user.nombre).toBe(userData.nombre); // Confirma el nombre
      expect(user.correo).toBe(userData.correo); // Verifica el correo
      expect(user.estado).toBe(true); // Asegura que el usuario esté activo por defecto
    });

    it('should throw an error if email already exists', async () => {
      const userData: IUserInput = {
        nombre: 'Juan Perez',
        correo: 'juan@test.com',
        contraseña: 'password123',
      };

      await UserService.createUser(userData); // Crea el primer usuario
      // Intenta crear otro usuario con el mismo correo
      await expect(UserService.createUser(userData)).rejects.toThrow(
        new AppError('El correo ya está registrado', 400) // Espera un error específico
      );
    });
  });

  // Pruebas para el método getAllUsers
  describe('getAllUsers', () => {
    it('should get all active users', async () => {
      // Crea varios usuarios con diferentes estados
      await User.create([
        { nombre: 'User1', correo: 'user1@test.com', contraseña: 'password1', estado: true },
        { nombre: 'User2', correo: 'user2@test.com', contraseña: 'password2', estado: false },
      ]);

      const users = await UserService.getAllUsers(); // Obtiene solo usuarios activos
      expect(users.length).toBe(1); // Verifica que solo se devuelva un usuario activo
      expect(users[0].nombre).toBe('User1'); // Confirma que es el usuario correcto
    });
  });

  // Pruebas para el método getUserById
  describe('getUserById', () => {
    it('should get a user by ID', async () => {
      const newUser = await User.create({
        nombre: 'Maria Lopez',
        correo: 'maria@test.com',
        contraseña: 'password123',
      });

      const user = await UserService.getUserById(newUser.id.toString()); // Busca por ID
      expect(user).toBeDefined(); // Verifica que se encontró el usuario
      expect(user?.nombre).toBe('Maria Lopez'); // Confirma el nombre
    });

    it('should throw an error if user is not found or inactive', async () => {
      const inactiveUser = await User.create({
        nombre: 'Inactive User',
        correo: 'inactive@test.com',
        contraseña: 'password123',
        estado: false, // Usuario inactivo
      });

      // Prueba con un ID inexistente
      await expect(UserService.getUserById(new mongoose.Types.ObjectId().toString())).rejects.toThrow(
        new AppError('Usuario no encontrado', 404)
      );
      // Prueba con un usuario inactivo
      await expect(UserService.getUserById(inactiveUser.id.toString())).rejects.toThrow(
        new AppError('Usuario no encontrado', 404)
      );
    });
  });

  // Pruebas para el método updateUser
  describe('updateUser', () => {
    it('should update a user successfully', async () => {
      const newUser = await User.create({
        nombre: 'Pedro Gomez',
        correo: 'pedro@test.com',
        contraseña: 'password123',
      });

      const updateData: IUserUpdate = { nombre: 'Pedro Updated' }; // Datos a actualizar
      const updatedUser = await UserService.updateUser(newUser.id.toString(), updateData);

      expect(updatedUser?.nombre).toBe('Pedro Updated'); // Verifica que el nombre se actualizó
    });

    it('should throw an error if email is already in use', async () => {
      await User.create([
        { nombre: 'User1', correo: 'user1@test.com', contraseña: 'password1' },
        { nombre: 'User2', correo: 'user2@test.com', contraseña: 'password2' },
      ]);

      const user1 = await User.findOne({ correo: 'user1@test.com' });
      const updateData: IUserUpdate = { correo: 'user2@test.com' }; // Intenta usar un correo existente

      await expect(UserService.updateUser(user1!.id.toString(), updateData)).rejects.toThrow(
        new AppError('El correo ya está en uso por otro usuario', 400)
      );
    });
  });

  // Pruebas para el método deleteUser
  describe('deleteUser', () => {
    it('should soft delete a user successfully', async () => {
      const newUser = await User.create({
        nombre: 'Ana Torres',
        correo: 'ana@test.com',
        contraseña: 'password123',
      });

      const deletedUser = await UserService.deleteUser(newUser.id.toString()); // Soft delete
      expect(deletedUser?.estado).toBe(false); // Verifica que el estado cambió a false

      const userInDb = await User.findById(newUser.id); // Consulta directa a la base de datos
      expect(userInDb?.estado).toBe(false); // Confirma el cambio en la base de datos
    });

    it('should throw an error if user is not found', async () => {
      // Intenta eliminar un usuario con un ID inexistente
      await expect(UserService.deleteUser(new mongoose.Types.ObjectId().toString())).rejects.toThrow(
        new AppError('Usuario no encontrado', 404)
      );
    });
  });

  // Pruebas para el método loginUser
  describe('loginUser', () => {
    it('should login a user and return token', async () => {
      const userData: IUserInput = {
        nombre: 'Luis Garcia',
        correo: 'luis@test.com',
        contraseña: 'password123',
      };

      await UserService.createUser(userData); // Crea el usuario
      (securityService.comparePasswords as jest.Mock).mockResolvedValue(true); // Simula contraseña correcta

      const loginResponse = await UserService.loginUser('luis@test.com', 'password123'); // Intenta iniciar sesión
      expect(loginResponse).toHaveProperty('usuario'); // Verifica que se devuelva un objeto usuario
      expect(loginResponse).toHaveProperty('token'); // Confirma que se generó un token
      expect(loginResponse.usuario.nombre).toBe('Luis Garcia'); // Asegura que los datos son correctos
    });

    it('should throw an error for invalid credentials', async () => {
      await User.create({
        nombre: 'Luis Garcia',
        correo: 'luis@test.com',
        contraseña: 'password123',
      });

      (securityService.comparePasswords as jest.Mock).mockResolvedValue(false); // Simula contraseña incorrecta

      // Prueba con contraseña incorrecta
      await expect(UserService.loginUser('luis@test.com', 'wrongpass')).rejects.toThrow(
        new AppError('Credenciales inválidas', 401)
      );
      // Prueba con correo inexistente
      await expect(UserService.loginUser('wrong@test.com', 'password123')).rejects.toThrow(
        new AppError('Credenciales inválidas', 401)
      );
    });
  });
});