import Submission from '../models/submission.model';
import { ISubmissionDocument, ISubmissionInput, ISubmissionGrade } from '../interfaces/submission.interface';
import { AppError } from '../lib/appError';

export class SubmissionService {
  /**
   * Crear una nueva entrega
   * @param submissionData Datos de la entrega
   */
  async createSubmission(submissionData: ISubmissionInput): Promise<ISubmissionDocument> {
    try {
      // Verificar si ya existe una entrega para esta evaluación y estudiante
      const existingSubmission = await Submission.findOne({
        evaluacion: submissionData.evaluacion,
        estudiante: submissionData.estudiante
      });
      if (existingSubmission) {
        throw new AppError('Ya existe una entrega para esta evaluación', 400);
      }
      const submission = new Submission(submissionData);
      return await submission.save();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener todas las entregas
   */
  async getAllSubmissions(): Promise<ISubmissionDocument[]> {
    try {
      return await Submission.find()
        .populate('evaluacion', 'titulo')
        .populate('estudiante', 'nombre');
    } catch (error) {
      throw new AppError('Error al obtener las entregas', 500);
    }
  }

  /**
   * Obtener entrega por ID
   * @param submissionId ID de la entrega
   */
  async getSubmissionById(submissionId: string): Promise<ISubmissionDocument | null> {
    try {
      const submission = await Submission.findById(submissionId)
        .populate('evaluacion', 'titulo')
        .populate('estudiante', 'nombre');
      if (!submission) {
        throw new AppError('Entrega no encontrada', 404);
      }
      return submission;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Calificar una entrega
   * @param submissionId ID de la entrega
   * @param gradeData Datos de calificación
   */
  async gradeSubmission(submissionId: string, gradeData: ISubmissionGrade): Promise<ISubmissionDocument | null> {
    try {
      const submission = await Submission.findById(submissionId);
      if (!submission) {
        throw new AppError('Entrega no encontrada', 404);
      }
      // Actualizar nota y comentarios
      submission.nota = gradeData.nota;
      submission.comentarios = gradeData.comentarios || submission.comentarios;
      return await submission.save();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Eliminar entrega por ID
   * @param submissionId ID de la entrega
   */
  async deleteSubmission(submissionId: string): Promise<void> {
    try {
      await Submission.findByIdAndDelete(submissionId);
    } catch (error) {
      throw new AppError('Error al eliminar la entrega', 500);
    }
  }
}

export default new SubmissionService();