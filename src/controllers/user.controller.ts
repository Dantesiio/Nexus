// src/controllers/user.controller.ts
import { Request, Response, NextFunction } from 'express';
import userService from '../services/user.service';
import { IUserInput, IUserUpdate, IUserLogin, UserRole} from '../interfaces/user.interface';
import { AppError } from '../lib/appError';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        rol: UserRole;
      };
    }
  }
}
export class UserController {
  /**
   * Crear un nuevo usuario
   * @route POST /api/usuarios
   */
  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Verificar si el usuario autenticado es superadmin
      const authUser = req.user;
      if (!authUser || authUser.rol !== UserRole.SUPERADMIN) {
        throw new AppError('No tienes permisos para crear usuarios', 403);
      }

      const userData: IUserInput = {
        nombre: req.body.nombre,
        correo: req.body.correo,
        contraseña: req.body.contraseña,
        rol: req.body.rol
      };

      const newUser = await userService.createUser(userData);
      
      // Excluir contraseña de la respuesta
      const userResponse = {
        id: newUser._id,
        nombre: newUser.nombre,
        correo: newUser.correo,
        rol: newUser.rol,
        estado: newUser.estado,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt
      };

      res.status(201).json({
        success: true,
        data: userResponse
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener todos los usuarios
   * @route GET /api/usuarios
   */
  async getAllUsers(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await userService.getAllUsers();
      
      // Mapear usuarios para excluir datos sensibles
      const usersResponse = users.map(user => ({
        id: user._id,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol,
        estado: user.estado,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }));

      res.status(200).json({
        success: true,
        count: usersResponse.length,
        data: usersResponse
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener usuario por ID
   * @route GET /api/usuarios/:id
   */
  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.id;
      const authUser = req.user;
      
      // Verificar permisos: solo superadmin puede ver cualquier usuario
      // Los usuarios regulares solo pueden ver su propio perfil
      if (!authUser || (authUser.rol !== UserRole.SUPERADMIN && authUser.id !== userId)) {
        throw new AppError('No tienes permisos para ver este usuario', 403);
      }

      const user = await userService.getUserById(userId);
      
      if (!user) {
        throw new AppError('Usuario no encontrado', 404);
      }

      const userResponse = {
        id: user._id,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol,
        estado: user.estado,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      res.status(200).json({
        success: true,
        data: userResponse
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualizar usuario por ID
   * @route PUT /api/usuarios/:id
   */
  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.id;
      const authUser = req.user;
      
      // Solo superadmin puede modificar cualquier usuario
      if (!authUser || authUser.rol !== UserRole.SUPERADMIN) {
        throw new AppError('No tienes permisos para modificar usuarios', 403);
      }

      const updateData: IUserUpdate = {
        nombre: req.body.nombre,
        correo: req.body.correo,
        rol: req.body.rol,
        estado: req.body.estado
      };

      const updatedUser = await userService.updateUser(userId, updateData);
      
      if (!updatedUser) {
        throw new AppError('Usuario no encontrado', 404);
      }

      const userResponse = {
        id: updatedUser._id,
        nombre: updatedUser.nombre,
        correo: updatedUser.correo,
        rol: updatedUser.rol,
        estado: updatedUser.estado,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      };

      res.status(200).json({
        success: true,
        data: userResponse
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Eliminar usuario (cambiar estado a false)
   * @route DELETE /api/usuarios/:id
   */
  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.id;
      const authUser = req.user;
      
      // Solo superadmin puede eliminar usuarios
      if (!authUser || authUser.rol !== UserRole.SUPERADMIN) {
        throw new AppError('No tienes permisos para eliminar usuarios', 403);
      }

      await userService.deleteUser(userId);

      res.status(200).json({
        success: true,
        message: 'Usuario eliminado correctamente'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Iniciar sesión de usuario
   * @route POST /api/auth/login
   */
  async loginUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const loginData: IUserLogin = {
        correo: req.body.correo,
        contraseña: req.body.contraseña
      };

      const result = await userService.loginUser(loginData.correo, loginData.contraseña);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener perfil del usuario autenticado
   * @route GET /api/auth/profile
   */
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authUser = req.user;
      
      if (!authUser) {
        throw new AppError('Usuario no autenticado', 401);
      }
      const user = await userService.getUserById(authUser.id);
      
      if (!user) {
        throw new AppError('Usuario no encontrado', 404);
      }

      const userResponse = {
        id: user._id,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol,
        estado: user.estado,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      res.status(200).json({
        success: true,
        data: userResponse
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();