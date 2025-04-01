import { Request, Response, NextFunction } from 'express';
import submissionService from '../services/submission.service';
import { ISubmissionInput, ISubmissionGrade } from '../interfaces/submission.interface';

//import { AppError } from '../lib/appError';

export class SubmissionController {
  /**
   * Crear una nueva entrega
   * @route POST /api/submissions
   */
  async createSubmission(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const submissionData: ISubmissionInput = req.body;
      const submission = await submissionService.createSubmission(submissionData);
      res.status(201).json({ success: true, data: submission });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener todas las entregas
   * @route GET /api/submissions
   */
  async getAllSubmissions(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const submissions = await submissionService.getAllSubmissions();
      res.status(200).json({ success: true, count: submissions.length, data: submissions });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener entrega por ID
   * @route GET /api/submissions/:id
   */
  async getSubmissionById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const submissionId = req.params.id;
      const submission = await submissionService.getSubmissionById(submissionId);
      res.status(200).json({ success: true, data: submission });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Calificar una entrega
   * @route PUT /api/submissions/:id/grade
   */
  async gradeSubmission(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const submissionId = req.params.id;
      const gradeData: ISubmissionGrade = req.body;
      const submission = await submissionService.gradeSubmission(submissionId, gradeData);
      res.status(200).json({ success: true, data: submission });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Eliminar entrega por ID
   * @route DELETE /api/submissions/:id
   */
  async deleteSubmission(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const submissionId = req.params.id;
      await submissionService.deleteSubmission(submissionId);
      res.status(200).json({ success: true, message: 'Entrega eliminada correctamente' });
    } catch (error) {
      next(error);
    }
  }
}

export default new SubmissionController();