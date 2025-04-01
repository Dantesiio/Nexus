// src/__tests__/controllers/submission.controller.test.ts
import { Request, Response, NextFunction } from 'express';
import { SubmissionController } from '../src/controllers/submission.controller';
import submissionService from '../src/services/submission.service';
import { AppError } from '../src/lib/appError';
import mongoose from 'mongoose';

// Mock del servicio de entregas para aislar las pruebas del controlador
jest.mock('../src/services/submission.service');

// Suite de pruebas para el controlador SubmissionController
describe('SubmissionController', () => {
  let submissionController: SubmissionController; // Instancia del controlador
  let req: Partial<Request>; // Mock parcial del objeto Request de Express
  let res: Partial<Response>; // Mock parcial del objeto Response de Express
  let next: NextFunction; // Mock de la función next para manejo de errores
  let mockSubmission: any; // Objeto simulado de una entrega para usar en las pruebas

  // Configuración inicial antes de cada prueba
  beforeEach(() => {
    jest.clearAllMocks(); // Reinicia todos los mocks para evitar interferencias entre pruebas

    submissionController = new SubmissionController(); // Crea una nueva instancia del controlador

    // Define una entrega simulada con datos básicos
    mockSubmission = {
      _id: new mongoose.Types.ObjectId().toString(), // ID único como string
      evaluacion: new mongoose.Types.ObjectId().toString(),
      estudiante: new mongoose.Types.ObjectId().toString(),
      archivo: 'http://ejemplo.com/archivo.pdf', // URL del archivo
      comentarios: 'Comentarios de prueba',
      nota: null,
      fecha_entrega: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Inicializa el mock de Request con objetos vacíos
    req = {
      body: {},
      params: {},
    };

    // Inicializa el mock de Response con funciones simuladas
    res = {
      status: jest.fn().mockReturnThis(), // Simula el método status y retorna el propio objeto
      json: jest.fn(), // Simula el método json para capturar la respuesta
    };

    // Inicializa el mock de NextFunction
    next = jest.fn(); // Simula la función next para manejar errores
  });

  // Pruebas para el método createSubmission
  describe('createSubmission', () => {
    beforeEach(() => {
      // Configura el cuerpo de la solicitud con datos válidos para crear una entrega
      req.body = {
        evaluacion: new mongoose.Types.ObjectId().toString(),
        estudiante: new mongoose.Types.ObjectId().toString(),
        archivo: 'http://ejemplo.com/archivo.pdf',
        comentarios: 'Comentarios iniciales',
      };
    });

    it('debería crear una entrega correctamente', async () => {
      // Mock del servicio para simular una creación exitosa
      const createdSubmission = {
        _id: new mongoose.Types.ObjectId().toString(),
        ...req.body,
        nota: null,
        fecha_entrega: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (submissionService.createSubmission as jest.Mock).mockResolvedValue(createdSubmission);

      // Ejecuta el método del controlador
      await submissionController.createSubmission(req as Request, res as Response, next);

      // Verifica que el servicio fue llamado con los datos correctos
      expect(submissionService.createSubmission).toHaveBeenCalledWith(req.body);
      // Confirma que se estableció el código de estado 201 (creado)
      expect(res.status).toHaveBeenCalledWith(201);
      // Verifica que la respuesta JSON contiene los datos esperados
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            evaluacion: req.body.evaluacion,
            estudiante: req.body.estudiante,
            archivo: req.body.archivo,
          }),
        })
      );
      // Asegura que no se llamó a next (sin errores)
      expect(next).not.toHaveBeenCalled();
    });

    it('debería manejar errores al crear una entrega', async () => {
      // Simula un error específico del servicio
      const error = new AppError('Ya existe una entrega para esta evaluación', 400);
      (submissionService.createSubmission as jest.Mock).mockRejectedValue(error);

      await submissionController.createSubmission(req as Request, res as Response, next);

      expect(submissionService.createSubmission).toHaveBeenCalledWith(req.body);
      // Verifica que el error se pasó a next para ser manejado por el middleware de errores
      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled(); // No se establece estado en caso de error
      expect(res.json).not.toHaveBeenCalled(); // No se envía respuesta JSON en caso de error
    });
  });

  // Pruebas para el método getAllSubmissions
  describe('getAllSubmissions', () => {
    it('debería obtener todas las entregas correctamente', async () => {
      // Mock del servicio con una lista de entregas
      const submissions = [
        mockSubmission,
        { ...mockSubmission, _id: new mongoose.Types.ObjectId().toString(), nota: 4.5 },
      ];
      (submissionService.getAllSubmissions as jest.Mock).mockResolvedValue(submissions);

      await submissionController.getAllSubmissions(req as Request, res as Response, next);

      expect(submissionService.getAllSubmissions).toHaveBeenCalled(); // Verifica la llamada al servicio
      expect(res.status).toHaveBeenCalledWith(200); // Código de estado OK
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2, // Número de entregas retornadas
        data: submissions,
      });
      expect(next).not.toHaveBeenCalled(); // Sin errores
    });

    it('debería manejar errores al obtener las entregas', async () => {
      const error = new Error('Error al obtener las entregas');
      (submissionService.getAllSubmissions as jest.Mock).mockRejectedValue(error);

      await submissionController.getAllSubmissions(req as Request, res as Response, next);

      expect(submissionService.getAllSubmissions).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error); // Error pasado a next
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  // Pruebas para el método getSubmissionById
  describe('getSubmissionById', () => {
    beforeEach(() => {
      req.params = { id: mockSubmission._id }; // Configura el ID en los parámetros
    });

    it('debería obtener una entrega por ID correctamente', async () => {
      (submissionService.getSubmissionById as jest.Mock).mockResolvedValue(mockSubmission);

      await submissionController.getSubmissionById(req as Request, res as Response, next);

      expect(submissionService.getSubmissionById).toHaveBeenCalledWith(mockSubmission._id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockSubmission });
      expect(next).not.toHaveBeenCalled();
    });

    it('debería manejar errores al obtener una entrega por ID', async () => {
      const error = new AppError('Entrega no encontrada', 404);
      (submissionService.getSubmissionById as jest.Mock).mockRejectedValue(error);

      await submissionController.getSubmissionById(req as Request, res as Response, next);

      expect(submissionService.getSubmissionById).toHaveBeenCalledWith(mockSubmission._id);
      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  // Pruebas para el método gradeSubmission
  describe('gradeSubmission', () => {
    beforeEach(() => {
      req.params = { id: mockSubmission._id }; // ID de la entrega a calificar
      req.body = { nota: 4.5, comentarios: 'Excelente trabajo' }; // Datos de calificación
    });

    it('debería calificar una entrega correctamente', async () => {
      const gradedSubmission = { ...mockSubmission, nota: 4.5, comentarios: 'Excelente trabajo' };
      (submissionService.gradeSubmission as jest.Mock).mockResolvedValue(gradedSubmission);

      await submissionController.gradeSubmission(req as Request, res as Response, next);

      expect(submissionService.gradeSubmission).toHaveBeenCalledWith(mockSubmission._id, req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: gradedSubmission });
      expect(next).not.toHaveBeenCalled();
    });

    it('debería manejar errores al calificar una entrega', async () => {
      const error = new AppError('Entrega no encontrada', 404);
      (submissionService.gradeSubmission as jest.Mock).mockRejectedValue(error);

      await submissionController.gradeSubmission(req as Request, res as Response, next);

      expect(submissionService.gradeSubmission).toHaveBeenCalledWith(mockSubmission._id, req.body);
      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  // Pruebas para el método deleteSubmission
  describe('deleteSubmission', () => {
    beforeEach(() => {
      req.params = { id: mockSubmission._id }; // ID de la entrega a eliminar
    });

    it('debería eliminar una entrega correctamente', async () => {
      (submissionService.deleteSubmission as jest.Mock).mockResolvedValue(undefined);

      await submissionController.deleteSubmission(req as Request, res as Response, next);

      expect(submissionService.deleteSubmission).toHaveBeenCalledWith(mockSubmission._id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Entrega eliminada correctamente',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('debería manejar errores al eliminar una entrega', async () => {
      const error = new Error('Error al eliminar la entrega');
      (submissionService.deleteSubmission as jest.Mock).mockRejectedValue(error);

      await submissionController.deleteSubmission(req as Request, res as Response, next);

      expect(submissionService.deleteSubmission).toHaveBeenCalledWith(mockSubmission._id);
      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});