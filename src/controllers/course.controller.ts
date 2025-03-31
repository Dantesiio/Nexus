import { Request, Response, NextFunction } from 'express';
import courseService from '../services/course.service';
import { ICourseInput, ICourseUpdate } from '../interfaces/course.interface';
import { AppError } from '../lib/appError';

export class CourseController {
  /**
   * Crear un nuevo curso
   * @route POST /api/courses
   */
  async createCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const courseData: ICourseInput = req.body;
      const course = await courseService.createCourse(courseData);
      res.status(201).json({ success: true, data: course });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener todos los cursos
   * @route GET /api/courses
   */
  async getAllCourses(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const courses = await courseService.getAllCourses();
      res.status(200).json({ success: true, count: courses.length, data: courses });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener curso por ID
   * @route GET /api/courses/:id
   */
  async getCourseById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const courseId = req.params.id;
      const course = await courseService.getCourseById(courseId);
      res.status(200).json({ success: true, data: course });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualizar curso por ID
   * @route PUT /api/courses/:id
   */
  async updateCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const courseId = req.params.id;
      const updateData: ICourseUpdate = req.body;
      const course = await courseService.updateCourse(courseId, updateData);
      res.status(200).json({ success: true, data: course });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Eliminar curso por ID
   * @route DELETE /api/courses/:id
   */
  async deleteCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const courseId = req.params.id;
      await courseService.deleteCourse(courseId);
      res.status(200).json({ success: true, message: 'Curso eliminado correctamente' });
    } catch (error) {
      next(error);
    }
  }
}

export default new CourseController();