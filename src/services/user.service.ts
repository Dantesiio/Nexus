// src/services/user.service.ts
import User from '../models/user.model';
import { IUserDocument, IUserInput, IUserUpdate, IUserLoginResponse } from '../interfaces/user.interface';
import { securityService } from './security.service'; // Import securityService
import jwt from 'jsonwebtoken';
import { AppError } from '../lib/appError';

export class UserService {
  /**
   * Crear un nuevo usuario
   * @param userData Datos del usuario a crear
   */
  async createUser(userData: IUserInput): Promise<IUserDocument> {
    try {
      // Verificar si el correo ya existe
      const existingUser = await User.findOne({ correo: userData.correo });
      if (existingUser) {
        throw new AppError('El correo ya está registrado', 400);
      }
      
      // Crear el usuario
      const user = new User(userData);
      return await user.save();
    } catch (error) {
        console.error('Error al crear el usuario:', error);
      // Rethrow para manejar errores específicos en el controlador
      throw error;
    }
  }

  /**
   * Obtener todos los usuarios
   */
  async getAllUsers(): Promise<IUserDocument[]> {
    try {
      return await User.find({ estado: true });
    } catch (error) {
      throw new AppError('Error al obtener usuarios', 500);
    }
  }

  /**
   * Obtener usuario por ID
   * @param userId ID del usuario
   */
  async getUserById(userId: string): Promise<IUserDocument | null> {
    try {
      const user = await User.findById(userId);
      if (!user || !user.estado) {
        throw new AppError('Usuario no encontrado', 404);
      }
      return user;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error al obtener el usuario', 500);
    }
  }

  /**
   * Actualizar usuario por ID
   * @param userId ID del usuario
   * @param updateData Datos a actualizar
   */
  async updateUser(userId: string, updateData: IUserUpdate): Promise<IUserDocument | null> {
    try {
      // Verificar si el usuario existe
      const user = await User.findById(userId);
      if (!user || !user.estado) {
        throw new AppError('Usuario no encontrado', 404);
      }

      // Verificar si se está actualizando el correo y si ya existe
      if (updateData.correo && updateData.correo !== user.correo) {
        const existingEmail = await User.findOne({ correo: updateData.correo });
        if (existingEmail) {
          throw new AppError('El correo ya está en uso por otro usuario', 400);
        }
      }

      // Actualizar el usuario
      return await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
      );
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error al actualizar el usuario', 500);
    }
  }

  /**
   * Eliminar usuario (cambiar estado a false)
   * @param userId ID del usuario
   */
  async deleteUser(userId: string): Promise<IUserDocument | null> {
    try {
      const user = await User.findById(userId);
      if (!user || !user.estado) {
        throw new AppError('Usuario no encontrado', 404);
      }

      return await User.findByIdAndUpdate(
        userId,
        { estado: false },
        { new: true }
      );
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error al eliminar el usuario', 500);
    }
  }

  /**
   * Autenticar usuario y generar token JWT
   * @param email Correo del usuario
   * @param password Contraseña del usuario
   */
  async loginUser(email: string, password: string): Promise<IUserLoginResponse> {
    try {
      // Buscar usuario por correo (incluir contraseña para verificación)
      const user = await User.findOne({ correo: email, estado: true }).select('+contraseña');
      
      if (!user) {
        throw new AppError('Credenciales inválidas', 401);
      }

      // Verificar contraseña
      const isPasswordValid = await securityService.comparePasswords(password, user.contraseña);
      console.log("Contraseña ingresada:", password);
      console.log("Contraseña en BD:", user.contraseña);
      console.log("Resultado comparación:", isPasswordValid);
      if (!isPasswordValid) {
        throw new AppError('Credenciales inválidas', 401);
      }

      // Generar token JWT
      const token = this.generateToken(user);

      // Devolver respuesta
      return {
        usuario: {
          id: user._id as string,
          nombre: user.nombre,
          correo: user.correo,
          rol: user.rol
        },
        token
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error al iniciar sesión', 500);
    }
  }

  /**
   * Generar token JWT
   * @param user Usuario autenticado
   */
  private generateToken(user: IUserDocument): string {
    const payload = {
      id: user._id,
      nombre: user.nombre,
      correo: user.correo,
      rol: user.rol
    };

    // Obtener clave secreta del entorno o usar una por defecto (en producción NUNCA usar una clave por defecto)
    const secretKey = process.env.JWT_SECRET ?? 'tu_clave_secreta_muy_segura';
    
    // Generar token con expiración de 24 horas
    return jwt.sign(payload, secretKey, { expiresIn: '24h' });
  }
}

export default new UserService();