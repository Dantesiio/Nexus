// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../interfaces/user.interface';
import { AppError } from '../lib/appError';

// Extender la interfaz de Express Request para incluir el usuario autenticado
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

interface DecodedToken {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  iat: number;
  exp: number;
}

export class AuthMiddleware {
  /**
   * Middleware para proteger rutas que requieren autenticación
   */
  authenticate(req: Request, _res: Response, next: NextFunction): void {
    try {
      // Obtener token del encabezado Authorization
      const authHeader = req.headers.authorization;
      if (!authHeader || authHeader.startsWith('Bearer ')) {
        throw new AppError('No se proporcionó token de autenticación', 401);
      }

      const token = authHeader.split(' ')[1];
      
      // Verificar token
      const secretKey = process.env.JWT_SECRET ?? 'tu_clave_secreta_muy_segura';
      const decoded = jwt.verify(token, secretKey) as DecodedToken;
      
      // Agregar usuario autenticado a la solicitud
      req.user = {
        id: decoded.id,
        rol: decoded.rol as UserRole
      };
      
      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        next(new AppError('Token inválido', 401));
      } else if (error instanceof jwt.TokenExpiredError) {
        next(new AppError('Token expirado', 401));
      } else {
        next(error);
      }
    }
  }

  /**
   * Middleware para verificar rol de superadmin
   */
  isSuperAdmin(req: Request, _res: Response, next: NextFunction): void {
    try {
      if (!req.user) {
        throw new AppError('No autenticado', 401);
      }

      if (req.user.rol !== UserRole.SUPERADMIN) {
        throw new AppError('Acceso denegado. Se requiere rol de superadmin', 403);
      }
      
      next();
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthMiddleware();