// src/interfaces/submission.interface.ts
import { Document, Types } from 'mongoose';

// Interfaz para el modelo de Mongoose
export interface ISubmissionDocument extends Document {
  evaluacion: Types.ObjectId;
  estudiante: Types.ObjectId;
  archivo: string;
  comentarios: string;
  nota: number | null;
  fecha_entrega: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Interfaz para crear una entrega
export interface ISubmissionInput {
  evaluacion: string;
  estudiante: string;
  archivo: string;
  comentarios?: string;
}

// Interfaz para calificar una entrega
export interface ISubmissionGrade {
  nota: number;
  comentarios?: string;
}

// Interfaz para la respuesta de una entrega
export interface ISubmissionResponse {
  id: string;
  evaluacion: {
    id: string;
    titulo: string;
  };
  estudiante: {
    id: string;
    nombre: string;
  };
  archivo: string;
  comentarios: string;
  nota: number | null;
  fecha_entrega: Date;
  createdAt: Date;
  updatedAt: Date;
}