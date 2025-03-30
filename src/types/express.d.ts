// src/types/express.d.ts
import { UserRole } from '../interfaces/user.interface';

declare namespace Express {
  interface Request {
    user?: {
      id: string;
      rol: UserRole;
    };
  }
}
