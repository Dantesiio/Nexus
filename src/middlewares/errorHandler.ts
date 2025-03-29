// src/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/appError';
import mongoose from 'mongoose';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('Error:', err);

  // AppError - Errores operacionales conocidos
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message
    });
  }

  // Errores de Mongoose/MongoDB
  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      status: 'fail',
      message: 'Error de validación',
      errors: messages
    });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      success: false,
      status: 'fail',
      message: `ID inválido: ${err.value}`
    });
  }

  // Error de duplicado en MongoDB (código 11000)
  if (err.name === 'MongoError' && (err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];
    return res.status(400).json({
      success: false,
      status: 'fail',
      message: `El valor del campo ${field} ya existe. Por favor use otro valor.`
    });
  }

  // Error no manejado específicamente (error de servidor)
  return res.status(500).json({
    success: false,
    status: 'error',
    message: 'Error interno del servidor'
  });
};