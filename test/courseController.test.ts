// src/__tests__/controllers/course.controller.test.ts
import { Request, Response, NextFunction } from 'express';
import { CourseController } from '../src/controllers/course.controller';
import courseService from '../src/services/course.service';
import { AppError } from '../src/lib/appError';
import mongoose from 'mongoose';
import { CourseStatus } from '../src/interfaces/course.interface';

// Mock del servicio de cursos
jest.mock('../src/services/course.service');

describe('CourseController', () => {
  let courseController: CourseController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let mockCourse: any;

  beforeEach(() => {
    // Reiniciar todos los mocks
    jest.clearAllMocks();

    // Crear instancia del controlador
    courseController = new CourseController();

    // Crear mock de un curso
    mockCourse = {
      _id: new mongoose.Types.ObjectId().toString(),
      nombre: 'Curso de Prueba',
      descripcion: 'Descripción del curso de prueba',
      codigo: 'TEST-101',
      docente: new mongoose.Types.ObjectId().toString(),
      estado: CourseStatus.ACTIVE,
      fecha_inicio: new Date('2023-01-01'),
      fecha_fin: new Date('2023-06-30'),
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

  describe('createCourse', () => {
    beforeEach(() => {
      req.body = {
        nombre: 'Nuevo Curso',
        descripcion: 'Descripción del nuevo curso',
        codigo: 'NEW-101',
        docente: new mongoose.Types.ObjectId().toString(),
        fecha_inicio: new Date('2023-01-15'),
        fecha_fin: new Date('2023-07-15')
      };
    });

    it('debería crear un curso correctamente', async () => {
      // Configurar mock del servicio
      (courseService.createCourse as jest.Mock).mockResolvedValue({
        _id: new mongoose.Types.ObjectId().toString(),
        ...req.body,
        estado: CourseStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Ejecutar función del controlador
      await courseController.createCourse(req as Request, res as Response, next);

      // Verificaciones
      expect(courseService.createCourse).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          nombre: req.body.nombre,
          codigo: req.body.codigo,
          docente: req.body.docente
        })
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('debería manejar errores al crear un curso', async () => {
      // Simular error en el servicio
      const error = new AppError('Error al crear el curso', 500);
      (courseService.createCourse as jest.Mock).mockRejectedValue(error);

      // Ejecutar función del controlador
      await courseController.createCourse(req as Request, res as Response, next);

      // Verificaciones
      expect(courseService.createCourse).toHaveBeenCalledWith(req.body);
      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('getAllCourses', () => {
    it('debería obtener todos los cursos correctamente', async () => {
      // Configurar mock del servicio
      const courses = [
        mockCourse,
        {
          ...mockCourse,
          _id: new mongoose.Types.ObjectId().toString(),
          nombre: 'Otro Curso',
          codigo: 'TEST-102'
        }
      ];
      (courseService.getAllCourses as jest.Mock).mockResolvedValue(courses);

      // Ejecutar función del controlador
      await courseController.getAllCourses(req as Request, res as Response, next);

      // Verificaciones
      expect(courseService.getAllCourses).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: courses
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('debería manejar errores al obtener los cursos', async () => {
      // Simular error en el servicio
      const error = new Error('Error al obtener los cursos');
      (courseService.getAllCourses as jest.Mock).mockRejectedValue(error);

      // Ejecutar función del controlador
      await courseController.getAllCourses(req as Request, res as Response, next);

      // Verificaciones
      expect(courseService.getAllCourses).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('getCourseById', () => {
    beforeEach(() => {
      req.params = { id: mockCourse._id };
    });

    it('debería obtener un curso por ID correctamente', async () => {
      // Configurar mock del servicio
      (courseService.getCourseById as jest.Mock).mockResolvedValue(mockCourse);

      // Ejecutar función del controlador
      await courseController.getCourseById(req as Request, res as Response, next);

      // Verificaciones
      expect(courseService.getCourseById).toHaveBeenCalledWith(mockCourse._id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCourse
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('debería manejar errores al obtener un curso por ID', async () => {
      // Simular error en el servicio
      const error = new AppError('Curso no encontrado', 404);
      (courseService.getCourseById as jest.Mock).mockRejectedValue(error);

      // Ejecutar función del controlador
      await courseController.getCourseById(req as Request, res as Response, next);

      // Verificaciones
      expect(courseService.getCourseById).toHaveBeenCalledWith(mockCourse._id);
      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('updateCourse', () => {
    beforeEach(() => {
      req.params = { id: mockCourse._id };
      req.body = {
        nombre: 'Curso Actualizado',
        descripcion: 'Descripción actualizada'
      };
    });

    it('debería actualizar un curso correctamente', async () => {
      // Configurar mock del servicio con el curso actualizado
      const updatedCourse = {
        ...mockCourse,
        nombre: 'Curso Actualizado',
        descripcion: 'Descripción actualizada',
        updatedAt: new Date()
      };
      (courseService.updateCourse as jest.Mock).mockResolvedValue(updatedCourse);

      // Ejecutar función del controlador
      await courseController.updateCourse(req as Request, res as Response, next);

      // Verificaciones
      expect(courseService.updateCourse).toHaveBeenCalledWith(
        mockCourse._id,
        req.body
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: updatedCourse
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('debería manejar errores al actualizar un curso', async () => {
      // Simular error en el servicio
      const error = new AppError('Error al actualizar el curso', 500);
      (courseService.updateCourse as jest.Mock).mockRejectedValue(error);

      // Ejecutar función del controlador
      await courseController.updateCourse(req as Request, res as Response, next);

      // Verificaciones
      expect(courseService.updateCourse).toHaveBeenCalledWith(
        mockCourse._id,
        req.body
      );
      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('deleteCourse', () => {
    beforeEach(() => {
      req.params = { id: mockCourse._id };
    });

    it('debería eliminar un curso correctamente', async () => {
      // Configurar mock del servicio
      (courseService.deleteCourse as jest.Mock).mockResolvedValue(undefined);

      // Ejecutar función del controlador
      await courseController.deleteCourse(req as Request, res as Response, next);

      // Verificaciones
      expect(courseService.deleteCourse).toHaveBeenCalledWith(mockCourse._id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Curso eliminado correctamente'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('debería manejar errores al eliminar un curso', async () => {
      // Simular error en el servicio
      const error = new Error('Error al eliminar el curso');
      (courseService.deleteCourse as jest.Mock).mockRejectedValue(error);

      // Ejecutar función del controlador
      await courseController.deleteCourse(req as Request, res as Response, next);

      // Verificaciones
      expect(courseService.deleteCourse).toHaveBeenCalledWith(mockCourse._id);
      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});