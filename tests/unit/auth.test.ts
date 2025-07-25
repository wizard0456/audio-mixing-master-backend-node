import { describe, it, expect, beforeEach } from '@jest/globals';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../../src/config/app';

describe('Authentication', () => {
  describe('Password Hashing', () => {
    it('should hash password correctly', async () => {
      const password = 'testPassword123';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(await bcrypt.compare(password, hashedPassword)).toBe(true);
    });

    it('should verify password correctly', async () => {
      const password = 'testPassword123';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const isValid = await bcrypt.compare(password, hashedPassword);
      expect(isValid).toBe(true);
    });
  });

  describe('JWT Token', () => {
    const mockPayload = {
      userId: '123',
      email: 'test@example.com',
      role: 'user',
    };

    it('should generate JWT token', () => {
      const secret = 'test-secret-key';
      const token = jwt.sign(mockPayload, secret, {
        expiresIn: '1h',
      });
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should verify JWT token', () => {
      const secret = 'test-secret-key';
      const token = jwt.sign(mockPayload, secret, {
        expiresIn: '1h',
      });
      
      const decoded = jwt.verify(token, secret) as any;
      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded.role).toBe(mockPayload.role);
    });
  });
}); 