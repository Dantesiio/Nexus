import mongoose from 'mongoose';
import User from '../src/models/user.model';
import { UserRole } from '../src/interfaces/user.interface';

describe('User Model', () => {

    beforeAll(async () => {
      if (mongoose.connection.readyState === 0) {
        await mongoose.connect('mongodb://localhost:27017/test', {});
      }
    });
    
    afterAll(async () => {
      await mongoose.disconnect();
    });
    const uniqueEmail = `test${Date.now()}@example.com`;

    it('should create a user successfully', async () => {
        const userData = {
            nombre: 'Juan Pérez',
            correo: uniqueEmail,
            contraseña: 'password123',
            rol: UserRole.REGULAR,
        };

        const user = new User(userData);
        const savedUser = await user.save();

        expect(savedUser._id).toBeDefined();
        expect(savedUser.nombre).toBe(userData.nombre);
        expect(savedUser.correo).toBe(userData.correo);
        expect(savedUser.rol).toBe(UserRole.REGULAR);
    });

    it('should hash the password before saving', async () => {
        const userData = {
            nombre: 'Carlos Gómez',
            correo: 'carlos@example.com',
            contraseña: 'mypassword',
            rol: UserRole.SUPERADMIN,
        };

        const user = new User(userData);
        await user.save();

        const savedUser = await User.findOne({ correo: userData.correo }).select('+contraseña');
        expect(savedUser).toBeDefined();
        expect(savedUser!.contraseña).not.toBe(userData.contraseña);
    });

    it('should not create a user without required fields', async () => {
        try {
            const user = new User({});
            await user.save();
        } catch (error: any) {
            expect(error.errors.nombre).toBeDefined();
            expect(error.errors.correo).toBeDefined();
            expect(error.errors.contraseña).toBeDefined();
        }
    });

    it('should not allow duplicate emails', async () => {
        const userData = {
            nombre: 'Luis Martínez',
            correo: 'luis@example.com',
            contraseña: 'securePass123',
            rol: UserRole.REGULAR,
        };

        await new User(userData).save();
        try {
            await new User(userData).save();
        } catch (error: any) {
            expect(error.code).toBe(11000); // Código de error de MongoDB para duplicados
        }
    });

    it('should not allow invalid email format', async () => {
        try {
            const user = new User({
                nombre: 'Ana López',
                correo: 'invalid-email',
                contraseña: 'pass1234',
                rol: UserRole.REGULAR,
            });
            await user.save();
        } catch (error: any) {
            expect(error.errors.correo).toBeDefined();
        }
    });

    it('should not allow a password shorter than 6 characters', async () => {
        try {
            const user = new User({
                nombre: 'Elena Ramírez',
                correo: 'elena@example.com',
                contraseña: '123',
                rol: UserRole.REGULAR,
            });
            await user.save();
        } catch (error: any) {
            expect(error.errors.contraseña).toBeDefined();
        }
    });
});
