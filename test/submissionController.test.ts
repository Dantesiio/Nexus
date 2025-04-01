// src/__tests__/controllers/submission.controller.test.ts
import { Request, Response, NextFunction } from 'express';
import { SubmissionController } from '../src/controllers/submission.controller';
import submissionService from '../src/services/submission.service';
import { AppError } from '../src/lib/appError';
import mongoose from 'mongoose';

// Mock del servicio de entregas
jest.mock('../src/services/submission.service');

describe('SubmissionController', () => {
  let submissionController: SubmissionController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let mockSubmission: any;

  beforeEach(() => {
    // Reiniciar todos los mocks
    jest.clearAllMocks();

    // Crear instancia del controlador
    submissionController = new SubmissionController();

    // Crear mock de una entrega
    mockSubmission = {
      _id: new mongoose.Types.ObjectId().toString(),
      evaluacion: new mongoose.Types.ObjectId().toString(),
      estudiante: new mongoose.Types.ObjectId().toString(),
      archivo: 'http://ejemplo.com/archivo.pdf',
      comentarios: 'Comentarios de prueba',
      nota: null,
      fecha_entrega: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Mock de request
    req = {
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

  describe('createSubmission', () => {
    beforeEach(() => {
      req.body = {
        evaluacion: new mongoose.Types.ObjectId().toString(),
        estudiante: new mongoose.Types.ObjectId().toString(),
        archivo: 'http://ejemplo.com/archivo.pdf',
        comentarios: 'Comentarios iniciales'
      };
    });

    it('debería crear una entrega correctamente', async () => {
      // Configurar mock del servicio
      (submissionService.createSubmission as jest.Mock).mockResolvedValue({
        _id: new mongoose.Types.ObjectId().toString(),
        ...req.body,
        nota: null,
        fecha_entrega: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Ejecutar función del controlador
      await submissionController.createSubmission(req as Request, res as Response, next);

      // Verificaciones
      expect(submissionService.createSubmission).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          evaluacion: req.body.evaluacion,
          estudiante: req.body.estudiante,
          archivo: req.body.archivo
        })
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('debería manejar errores al crear una entrega', async () => {
      // Simular error en el servicio
      const error = new AppError('Ya existe una entrega para esta evaluación', 400);
      (submissionService.createSubmission as jest.Mock).mockRejectedValue(error);

      // Ejecutar función del controlador
      await submissionController.createSubmission(req as Request, res as Response, next);

      // Verificaciones
      expect(submissionService.createSubmission).toHaveBeenCalledWith(req.body);
      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('getAllSubmissions', () => {
    it('debería obtener todas las entregas correctamente', async () => {
      // Configurar mock del servicio
      const submissions = [
        mockSubmission,
        {
          ...mockSubmission,
          _id: new mongoose.Types.ObjectId().toString(),
          nota: 4.5
        }
      ];
      (submissionService.getAllSubmissions as jest.Mock).mockResolvedValue(submissions);

      // Ejecutar función del controlador
      await submissionController.getAllSubmissions(req as Request, res as Response, next);

      // Verificaciones
      expect(submissionService.getAllSubmissions).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: submissions
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('debería manejar errores al obtener las entregas', async () => {
      // Simular error en el servicio
      const error = new Error('Error al obtener las entregas');
      (submissionService.getAllSubmissions as jest.Mock).mockRejectedValue(error);

      // Ejecutar función del controlador
      await submissionController.getAllSubmissions(req as Request, res as Response, next);

      // Verificaciones
      expect(submissionService.getAllSubmissions).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('getSubmissionById', () => {
    beforeEach(() => {
      req.params = { id: mockSubmission._id };
    });

    it('debería obtener una entrega por ID correctamente', async () => {
      // Configurar mock del servicio
      (submissionService.getSubmissionById as jest.Mock).mockResolvedValue(mockSubmission);

      // Ejecutar función del controlador
      await submissionController.getSubmissionById(req as Request, res as Response, next);

      // Verificaciones
      expect(submissionService.getSubmissionById).toHaveBeenCalledWith(mockSubmission._id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockSubmission
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('debería manejar errores al obtener una entrega por ID', async () => {
      // Simular error en el servicio
      const error = new AppError('Entrega no encontrada', 404);
      (submissionService.getSubmissionById as jest.Mock).mockRejectedValue(error);

      // Ejecutar función del controlador
      await submissionController.getSubmissionById(req as Request, res as Response, next);

      // Verificaciones
      expect(submissionService.getSubmissionById).toHaveBeenCalledWith(mockSubmission._id);
      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('gradeSubmission', () => {
    beforeEach(() => {
      req.params = { id: mockSubmission._id };
      req.body = {
        nota: 4.5,
        comentarios: 'Excelente trabajo'
      };
    });

    it('debería calificar una entrega correctamente', async () => {
      // Configurar mock del servicio con la entrega calificada
      const gradedSubmission = {
        ...mockSubmission,
        nota: 4.5,
        comentarios: 'Excelente trabajo'
      };
      (submissionService.gradeSubmission as jest.Mock).mockResolvedValue(gradedSubmission);

      // Ejecutar función del controlador
      await submissionController.gradeSubmission(req as Request, res as Response, next);

      // Verificaciones
      expect(submissionService.gradeSubmission).toHaveBeenCalledWith(
        mockSubmission._id,
        req.body
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: gradedSubmission
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('debería manejar errores al calificar una entrega', async () => {
      // Simular error en el servicio
      const error = new AppError('Entrega no encontrada', 404);
      (submissionService.gradeSubmission as jest.Mock).mockRejectedValue(error);

      // Ejecutar función del controlador
      await submissionController.gradeSubmission(req as Request, res as Response, next);

      // Verificaciones
      expect(submissionService.gradeSubmission).toHaveBeenCalledWith(
        mockSubmission._id,
        req.body
      );
      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('deleteSubmission', () => {
    beforeEach(() => {
      req.params = { id: mockSubmission._id };
    });

    it('debería eliminar una entrega correctamente', async () => {
      // Configurar mock del servicio
      (submissionService.deleteSubmission as jest.Mock).mockResolvedValue(undefined);

      // Ejecutar función del controlador
      await submissionController.deleteSubmission(req as Request, res as Response, next);

      // Verificaciones
      expect(submissionService.deleteSubmission).toHaveBeenCalledWith(mockSubmission._id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Entrega eliminada correctamente'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('debería manejar errores al eliminar una entrega', async () => {
      // Simular error en el servicio
      const error = new Error('Error al eliminar la entrega');
      (submissionService.deleteSubmission as jest.Mock).mockRejectedValue(error);

      // Ejecutar función del controlador
      await submissionController.deleteSubmission(req as Request, res as Response, next);

      // Verificaciones
      expect(submissionService.deleteSubmission).toHaveBeenCalledWith(mockSubmission._id);
      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});