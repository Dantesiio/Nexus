import { Router } from 'express';
import submissionController from '../controllers/submission.controller';
import authMiddleware from '../middlewares/auth.middleware';

const router = Router();

// Rutas protegidas
router.post(
  '/submissions',
  authMiddleware.authenticate,
  submissionController.createSubmission
);

router.get(
  '/submissions',
  authMiddleware.authenticate,
  submissionController.getAllSubmissions
);

router.get(
  '/submissions/:id',
  authMiddleware.authenticate,
  submissionController.getSubmissionById
);

router.put(
  '/submissions/:id/grade',
  authMiddleware.authenticate,
  submissionController.gradeSubmission
);

router.delete(
  '/submissions/:id',
  authMiddleware.authenticate,
  submissionController.deleteSubmission
);

export default router;