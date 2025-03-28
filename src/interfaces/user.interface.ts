// File: src/interfaces/user.interface.ts
// src/interfaces/user.interface.ts
import { Document } from 'mongoose';

export enum UserRole {
  SUPERADMIN = 'superadmin',
  REGULAR = 'regular'
}

// Interfaz para el modelo de Mongoose
export interface IUserDocument extends Document {
  nombre: string;
  correo: string;
  contraseña: string;
  rol: UserRole;
  estado: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Interfaz para crear un usuario
export interface IUserInput {
  nombre: string;
  correo: string;
  contraseña: string;
  rol?: UserRole;
}

// Interfaz para actualizar un usuario
export interface IUserUpdate {
  nombre?: string;
  correo?: string;
  rol?: UserRole;
  estado?: boolean;
}

// Interfaz para iniciar sesión
export interface IUserLogin {
  correo: string;
  contraseña: string;
}

// Interfaz para la respuesta del login
export interface IUserLoginResponse {
  usuario: {
    id: string;
    nombre: string;
    correo: string;
    rol: string;
  };
  token: string;
}

// Interfaz para la respuesta de un usuario (sin datos sensibles)
export interface IUserResponse {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  estado: boolean;
  createdAt: Date;
  updatedAt: Date;
}