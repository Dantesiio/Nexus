import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { securityService } from '../src/services/security.service';

describe('SecurityService', () => {
  it('should encrypt a password successfully', async () => {
    const password = 'mySecurePassword';
    const hashedPassword = await securityService.encryptPassword(password);
    
    expect(hashedPassword).toBeDefined();
    expect(typeof hashedPassword).toBe('string');
    expect(hashedPassword).not.toBe(password);
  });

  it('should generate a valid JWT token', async () => {
    const userId = new mongoose.Types.ObjectId();
    const email = 'test@example.com';
    const role = 'user';
    
    const token = await securityService.generateToken(userId, email, role);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    
    const decoded = jwt.verify(token, 'secret');
    expect(decoded).toHaveProperty('_id', userId.toString());
    expect(decoded).toHaveProperty('email', email);
    expect(decoded).toHaveProperty('role', role);
  });

  it('should compare passwords correctly', async () => {
    const password = 'securePassword';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const isMatch = await securityService.comparePasswords(password, hashedPassword);
    expect(isMatch).toBe(true);
  });

  it('should return false for incorrect password comparison', async () => {
    const password = 'securePassword';
    const incorrectPassword = 'wrongPassword';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const isMatch = await securityService.comparePasswords(incorrectPassword, hashedPassword);
    expect(isMatch).toBe(false);
  });
});