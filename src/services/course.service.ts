import Course from '../models/course.model';
import { ICourseDocument, ICourseInput, ICourseUpdate } from '../interfaces/course.interface';
import { AppError } from '../lib/appError';

export class CourseService {
  /**
   * Crear un nuevo curso
   * @param courseData Datos del curso
   */
  async createCourse(courseData: ICourseInput): Promise<ICourseDocument> {
    try {
      const course = new Course(courseData);
      return await course.save();
    } catch (error) {
      throw new AppError('Error al crear el curso', 500);
    }
  }

  /**
   * Obtener todos los cursos
   */
  async getAllCourses(): Promise<ICourseDocument[]> {
    try {
      return await Course.find().populate('docente', 'nombre');
    } catch (error) {
      throw new AppError('Error al obtener los cursos', 500);
    }
  }

  /**
   * Obtener curso por ID
   * @param courseId ID del curso
   */
  async getCourseById(courseId: string): Promise<ICourseDocument | null> {
    try {
      const course = await Course.findById(courseId).populate('docente', 'nombre');
      if (!course) {
        throw new AppError('Curso no encontrado', 404);
      }
      return course;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar curso por ID
   * @param courseId ID del curso
   * @param updateData Datos a actualizar
   */
  async updateCourse(courseId: string, updateData: ICourseUpdate): Promise<ICourseDocument | null> {
    try {
      return await Course.findByIdAndUpdate(courseId, { $set: updateData }, { new: true, runValidators: true });
    } catch (error) {
      throw new AppError('Error al actualizar el curso', 500);
    }
  }

  /**
   * Eliminar curso por ID
   * @param courseId ID del curso
   */
  async deleteCourse(courseId: string): Promise<void> {
    try {
      await Course.findByIdAndDelete(courseId);
    } catch (error) {
      throw new AppError('Error al eliminar el curso', 500);
    }
  }
}

export default new CourseService();