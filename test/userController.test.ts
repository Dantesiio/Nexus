// src/__tests__/controllers/user.controller.test.ts
import { Request, Response, NextFunction } from 'express';
import { UserController } from '../src/controllers/user.controller';
import userService from '../src/services/user.service';
import { AppError } from '../src/lib/appError';
import { UserRole } from '../src/interfaces/user.interface';
import mongoose from 'mongoose';

// Mock del servicio de usuario
jest.mock('../src/services/user.service');

describe('UserController', () => {
  let userController: UserController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let mockUser: any;
  let mockSuperAdmin: any;

  beforeEach(() => {
    // Reiniciar todos los mocks
    jest.clearAllMocks();

    // Crear instancia del controlador
    userController = new UserController();

    // Crear mock de usuario regular
    mockUser = {
      _id: new mongoose.Types.ObjectId().toString(),
      nombre: 'Usuario Test',
      correo: 'usuario@test.com',
      rol: UserRole.REGULAR,
      estado: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Crear mock de usuario superadmin
    mockSuperAdmin = {
      _id: new mongoose.Types.ObjectId().toString(),
      nombre: 'Super Admin',
      correo: 'admin@test.com',
      rol: UserRole.SUPERADMIN,
      estado: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Mock de request
    req = {
      user: {
        id: mockSuperAdmin._id,
        rol: UserRole.SUPERADMIN
      },
      body: {},
      params: {}
    };

    // Mock de response
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Mock de next
    next = jest.fn();
  });

  describe('createUser', () => {
    beforeEach(() => {
      req.body = {
        nombre: 'Nuevo Usuario',
        correo: 'nuevo@test.com',
        contraseña: 'password123',
        rol: UserRole.REGULAR
      };
    });

    it('debería crear un usuario correctamente cuando el usuario autenticado es superadmin', async () => {
      // Configurar mock del servicio
      (userService.createUser as jest.Mock).mockResolvedValue({
        _id: new mongoose.Types.ObjectId().toString(),
        ...req.body,
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Ejecutar función del controlador
      await userController.createUser(req as Request, res as Response, next);

      // Verificaciones
      expect(userService.createUser).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          nombre: req.body.nombre,
          correo: req.body.correo,
          rol: req.body.rol
        })
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('debería lanzar error 403 cuando el usuario no es superadmin', async () => {
      // Cambiar rol a usuario regular
      req.user = { id: mockUser._id, rol: UserRole.REGULAR };

      // Ejecutar función del controlador
      await userController.createUser(req as Request, res as Response, next);

      // Verificaciones
      expect(userService.createUser).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'No tienes permisos para crear usuarios',
          statusCode: 403
        })
      );
    });

    it('debería pasar cualquier error del servicio al middleware next', async () => {
      // Simular error en el servicio
      const error = new Error('Error de prueba');
      (userService.createUser as jest.Mock).mockRejectedValue(error);

      // Ejecutar función del controlador
      await userController.createUser(req as Request, res as Response, next);

      // Verificaciones
      expect(userService.createUser).toHaveBeenCalledWith(req.body);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getAllUsers', () => {
    it('debería obtener todos los usuarios correctamente', async () => {
      // Mock de usuarios retornados
      const users = [mockUser, mockSuperAdmin];
      (userService.getAllUsers as jest.Mock).mockResolvedValue(users);

      // Ejecutar función del controlador
      await userController.getAllUsers(req as Request, res as Response, next);

      // Verificaciones
      expect(userService.getAllUsers).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: expect.arrayContaining([
          expect.objectContaining({
            nombre: mockUser.nombre,
            correo: mockUser.correo,
            rol: mockUser.rol
          }),
          expect.objectContaining({
            nombre: mockSuperAdmin.nombre,
            correo: mockSuperAdmin.correo,
            rol: mockSuperAdmin.rol
          })
        ])
      });
    });

    it('debería manejar errores correctamente', async () => {
      // Simular error en el servicio
      const error = new Error('Error al obtener usuarios');
      (userService.getAllUsers as jest.Mock).mockRejectedValue(error);

      // Ejecutar función del controlador
      await userController.getAllUsers(req as Request, res as Response, next);

      // Verificaciones
      expect(userService.getAllUsers).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getUserById', () => {
    beforeEach(() => {
      req.params = { id: mockUser._id };
    });

    it('debería obtener un usuario por ID cuando el usuario autenticado es superadmin', async () => {
      // Configurar mock del servicio
      (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);

      // Ejecutar función del controlador
      await userController.getUserById(req as Request, res as Response, next);

      // Verificaciones
      expect(userService.getUserById).toHaveBeenCalledWith(mockUser._id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          nombre: mockUser.nombre,
          correo: mockUser.correo,
          rol: mockUser.rol
        })
      });
    });

    it('debería permitir a un usuario regular ver su propio perfil', async () => {
      // Cambiar usuario autenticado a usuario regular
      req.user = { id: mockUser._id, rol: UserRole.REGULAR };
      req.params = { id: mockUser._id };

      // Configurar mock del servicio
      (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);

      // Ejecutar función del controlador
      await userController.getUserById(req as Request, res as Response, next);

      // Verificaciones
      expect(userService.getUserById).toHaveBeenCalledWith(mockUser._id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          nombre: mockUser.nombre,
          correo: mockUser.correo,
          rol: mockUser.rol
        })
      });
    });

    it('debería lanzar error 403 cuando un usuario regular intenta ver el perfil de otro usuario', async () => {
      // Cambiar usuario autenticado a usuario regular
      req.user = { id: mockUser._id, rol: UserRole.REGULAR };
      req.params = { id: mockSuperAdmin._id }; // Intentar ver otro perfil

      // Ejecutar función del controlador
      await userController.getUserById(req as Request, res as Response, next);

      // Verificaciones
      expect(userService.getUserById).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'No tienes permisos para ver este usuario',
          statusCode: 403
        })
      );
    });

    it('debería manejar correctamente cuando el usuario no existe', async () => {
      // Configurar mock del servicio para retornar null
      (userService.getUserById as jest.Mock).mockResolvedValue(null);

      // Ejecutar función del controlador
      await userController.getUserById(req as Request, res as Response, next);

      // Verificaciones
      expect(userService.getUserById).toHaveBeenCalledWith(mockUser._id);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Usuario no encontrado',
          statusCode: 404
        })
      );
    });
  });

  describe('updateUser', () => {
    beforeEach(() => {
      req.params = { id: mockUser._id };
      req.body = {
        nombre: 'Nombre Actualizado',
        correo: 'actualizado@test.com',
        rol: UserRole.REGULAR,
        estado: true
      };
    });

    it('debería actualizar un usuario correctamente cuando el usuario autenticado es superadmin', async () => {
      // Configurar mock del servicio
      const updatedUser = {
        ...mockUser,
        nombre: 'Nombre Actualizado',
        correo: 'actualizado@test.com'
      };
      (userService.updateUser as jest.Mock).mockResolvedValue(updatedUser);

      // Ejecutar función del controlador
      await userController.updateUser(req as Request, res as Response, next);

      // Verificaciones
      expect(userService.updateUser).toHaveBeenCalledWith(mockUser._id, req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          nombre: updatedUser.nombre,
          correo: updatedUser.correo,
          rol: updatedUser.rol
        })
      });
    });

    it('debería lanzar error 403 cuando el usuario no es superadmin', async () => {
      // Cambiar rol a usuario regular
      req.user = { id: mockUser._id, rol: UserRole.REGULAR };

      // Ejecutar función del controlador
      await userController.updateUser(req as Request, res as Response, next);

      // Verificaciones
      expect(userService.updateUser).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'No tienes permisos para modificar usuarios',
          statusCode: 403
        })
      );
    });

    it('debería manejar correctamente cuando el usuario a actualizar no existe', async () => {
      // Configurar mock del servicio para retornar null
      (userService.updateUser as jest.Mock).mockResolvedValue(null);

      // Ejecutar función del controlador
      await userController.updateUser(req as Request, res as Response, next);

      // Verificaciones
      expect(userService.updateUser).toHaveBeenCalledWith(mockUser._id, req.body);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Usuario no encontrado',
          statusCode: 404
        })
      );
    });
  });

  describe('deleteUser', () => {
    beforeEach(() => {
      req.params = { id: mockUser._id };
    });

    it('debería eliminar un usuario correctamente cuando el usuario autenticado es superadmin', async () => {
      // Configurar mock del servicio
      (userService.deleteUser as jest.Mock).mockResolvedValue({ ...mockUser, estado: false });

      // Ejecutar función del controlador
      await userController.deleteUser(req as Request, res as Response, next);

      // Verificaciones
      expect(userService.deleteUser).toHaveBeenCalledWith(mockUser._id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Usuario eliminado correctamente'
      });
    });

    it('debería lanzar error 403 cuando el usuario no es superadmin', async () => {
      // Cambiar rol a usuario regular
      req.user = { id: mockUser._id, rol: UserRole.REGULAR };

      // Ejecutar función del controlador
      await userController.deleteUser(req as Request, res as Response, next);

      // Verificaciones
      expect(userService.deleteUser).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'No tienes permisos para eliminar usuarios',
          statusCode: 403
        })
      );
    });

    it('debería manejar errores del servicio correctamente', async () => {
      // Simular error en el servicio
      const error = new Error('Error al eliminar usuario');
      (userService.deleteUser as jest.Mock).mockRejectedValue(error);

      // Ejecutar función del controlador
      await userController.deleteUser(req as Request, res as Response, next);

      // Verificaciones
      expect(userService.deleteUser).toHaveBeenCalledWith(mockUser._id);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('loginUser', () => {
    beforeEach(() => {
      req.body = {
        correo: 'usuario@test.com',
        contraseña: 'password123'
      };
    });

    it('debería autenticar al usuario correctamente', async () => {
      // Mock de respuesta de login
      const loginResponse = {
        usuario: {
          id: mockUser._id,
          nombre: mockUser.nombre,
          correo: mockUser.correo,
          rol: mockUser.rol
        },
        token: 'jwt-token-example'
      };
      
      // Configurar mock del servicio
      (userService.loginUser as jest.Mock).mockResolvedValue(loginResponse);

      // Ejecutar función del controlador
      await userController.loginUser(req as Request, res as Response, next);

      // Verificaciones
      expect(userService.loginUser).toHaveBeenCalledWith(
        req.body.correo,
        req.body.contraseña
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: loginResponse
      });
    });

    it('debería manejar error de credenciales inválidas', async () => {
      // Simular error de credenciales
      const error = new AppError('Credenciales inválidas', 401);
      (userService.loginUser as jest.Mock).mockRejectedValue(error);

      // Ejecutar función del controlador
      await userController.loginUser(req as Request, res as Response, next);

      // Verificaciones
      expect(userService.loginUser).toHaveBeenCalledWith(
        req.body.correo,
        req.body.contraseña
      );
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getProfile', () => {
    it('debería obtener el perfil del usuario autenticado correctamente', async () => {
      // Configurar mock del servicio
      (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);

      // Ejecutar función del controlador
      await userController.getProfile(req as Request, res as Response, next);

      // Verificaciones
      expect(userService.getUserById).toHaveBeenCalledWith(req.user?.id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          nombre: mockUser.nombre,
          correo: mockUser.correo,
          rol: mockUser.rol
        })
      });
    });

    it('debería lanzar error 401 cuando no hay usuario autenticado', async () => {
      // Quitar usuario autenticado
      req.user = undefined;

      // Ejecutar función del controlador
      await userController.getProfile(req as Request, res as Response, next);

      // Verificaciones
      expect(userService.getUserById).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Usuario no autenticado',
          statusCode: 401
        })
      );
    });

    it('debería manejar correctamente cuando el usuario no existe', async () => {
      // Configurar mock del servicio para retornar null
      (userService.getUserById as jest.Mock).mockResolvedValue(null);

      // Ejecutar función del controlador
      await userController.getProfile(req as Request, res as Response, next);

      // Verificaciones
      expect(userService.getUserById).toHaveBeenCalledWith(req.user?.id);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Usuario no encontrado',
          statusCode: 404
        })
      );
    });
  });
});