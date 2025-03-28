// src/routes/user.route.ts
import { Router } from 'express';
import userController from '../controllers/user.controller';
import authMiddleware from '../middlewares/auth.middleware';

const router = Router();

// Rutas de autenticación (públicas)
router.post('/auth/login', userController.loginUser);

// Rutas protegidas - Requieren autenticación
router.get('/auth/profile', authMiddleware.authenticate, userController.getProfile);

// Rutas de usuarios - Solo accesibles por superadmin
router.post(
  '/usuarios',
  authMiddleware.authenticate,
  authMiddleware.isSuperAdmin,
  userController.createUser
);

router.get(
  '/usuarios',
  authMiddleware.authenticate,
  authMiddleware.isSuperAdmin,
  userController.getAllUsers
);

router.get(
  '/usuarios/:id',
  authMiddleware.authenticate,
  userController.getUserById // Este controlador ya verifica permisos internamente
);

router.put(
  '/usuarios/:id',
  authMiddleware.authenticate,
  authMiddleware.isSuperAdmin,
  userController.updateUser
);

router.delete(
  '/usuarios/:id',
  authMiddleware.authenticate,
  authMiddleware.isSuperAdmin,
  userController.deleteUser
);

export default router;