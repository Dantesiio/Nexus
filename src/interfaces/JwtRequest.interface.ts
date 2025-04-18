//src/interfaces/JwtRequest.interface.ts
import {Request} from 'express';
import { UserRole } from './user.interface';

export interface JwtRequest extends Request{
    user?:{
        id: string,
        rol: UserRole
    }
}