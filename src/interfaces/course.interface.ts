// src/interfaces/course.interface.ts
import { Document, Types } from 'mongoose';

export enum CourseStatus {
  ACTIVE = 'ACTIVO',
  INACTIVE = 'INACTIVO'
}

// Interfaz para el modelo de Mongoose
export interface ICourseDocument extends Document {
  nombre: string;
  descripcion: string;
  codigo: string;
  docente: Types.ObjectId;
  estado: CourseStatus;
  fecha_inicio: Date;
  fecha_fin: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Interfaz para crear un curso
export interface ICourseInput {
  nombre: string;
  descripcion: string;
  codigo: string;
  docente: string;
  estado?: CourseStatus;
  fecha_inicio: Date;
  fecha_fin: Date;
}

// Interfaz para actualizar un curso
export interface ICourseUpdate {
  nombre?: string;
  descripcion?: string;
  codigo?: string;
  docente?: string;
  estado?: CourseStatus;
  fecha_inicio?: Date;
  fecha_fin?: Date;
}

// Interfaz para la respuesta de un curso
export interface ICourseResponse {
  id: string;
  nombre: string;
  descripcion: string;
  codigo: string;
  docente: {
    id: string;
    nombre: string;
  };
  estado: CourseStatus;
  fecha_inicio: Date;
  fecha_fin: Date;
  createdAt: Date;
  updatedAt: Date;
}