import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { securityService } from '../src/services/security.service';

// Suite de pruebas para el servicio SecurityService
describe('SecurityService', () => {
  // Prueba la encriptación exitosa de una contraseña
  it('should encrypt a password successfully', async () => {
    const password = 'mySecurePassword'; // Contraseña de ejemplo a encriptar

    const hashedPassword = await securityService.encryptPassword(password); // Encripta la contraseña usando el servicio

    // Verificaciones clave
    expect(hashedPassword).toBeDefined(); // Confirma que se generó un hash
    expect(typeof hashedPassword).toBe('string'); // Asegura que el resultado es una cadena
    expect(hashedPassword).not.toBe(password); // Verifica que el hash no sea igual a la contraseña original
  });

  // Prueba la generación de un token JWT válido
  it('should generate a valid JWT token', async () => {
    // Datos de entrada para simular un usuario
    const userId = new mongoose.Types.ObjectId(); // ID único generado por Mongoose
    const email = 'test@example.com'; // Correo del usuario
    const role = 'user'; // Rol del usuario

    const token = await securityService.generateToken(userId, email, role); // Genera el token con el servicio

    // Verificaciones del token generado
    expect(token).toBeDefined(); // Confirma que se generó un token
    expect(typeof token).toBe('string'); // Asegura que el token es una cadena

    // Decodifica y verifica el contenido del token
    const decoded = jwt.verify(token, 'secret'); // Usa la clave secreta por defecto para verificar (ajusta según implementación real)
    expect(decoded).toHaveProperty('_id', userId.toString()); // Verifica que el ID coincida
    expect(decoded).toHaveProperty('email', email); // Confirma que el correo está presente
    expect(decoded).toHaveProperty('role', role); // Asegura que el rol está incluido
  });

  // Prueba la comparación correcta de contraseñas
  it('should compare passwords correctly', async () => {
    const password = 'securePassword'; // Contraseña original
    const hashedPassword = await bcrypt.hash(password, 10); // Genera un hash con bcrypt para simular una contraseña almacenada

    const isMatch = await securityService.comparePasswords(password, hashedPassword); // Compara la contraseña con su hash

    expect(isMatch).toBe(true); // Verifica que la comparación sea exitosa (contraseña correcta)
  });

  // Prueba la comparación fallida con una contraseña incorrecta
  it('should return false for incorrect password comparison', async () => {
    const password = 'securePassword'; // Contraseña original
    const incorrectPassword = 'wrongPassword'; // Contraseña incorrecta para la comparación
    const hashedPassword = await bcrypt.hash(password, 10); // Genera un hash con la contraseña original

    const isMatch = await securityService.comparePasswords(incorrectPassword, hashedPassword); // Compara la contraseña incorrecta con el hash

    expect(isMatch).toBe(false); // Confirma que la comparación falla (contraseña incorrecta)
  });
});