import { Router } from 'express';
import courseController from '../controllers/course.controller';
import authMiddleware from '../middlewares/auth.middleware';

const router = Router();

// Rutas protegidas
router.post(
  '/courses',
  authMiddleware.authenticate,
  courseController.createCourse
);

router.get(
  '/courses',
  authMiddleware.authenticate,
  courseController.getAllCourses
);

router.get(
  '/courses/:id',
  authMiddleware.authenticate,
  courseController.getCourseById
);

router.put(
  '/courses/:id',
  authMiddleware.authenticate,
  courseController.updateCourse
);

router.delete(
  '/courses/:id',
  authMiddleware.authenticate,
  courseController.deleteCourse
);

export default router;