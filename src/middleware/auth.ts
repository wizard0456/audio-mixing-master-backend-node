import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export interface AuthRequest extends Request {
  user?: any;
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    console.log('I am in auth middleware.');
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log(token);
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Handle admin token format: "id|jwt_token"
    let jwtToken: string;
    if (token.includes('|')) {
      const parts = token.split('|');
      if (parts.length < 2 || !parts[1]) {
        return res.status(401).json({ message: 'Token is not valid' });
      }
      jwtToken = parts[1];
    } else {
      jwtToken = token;
    }

    if (!jwtToken) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    const decoded = jwt.verify(jwtToken, 'fallback-secret') as any;
    
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'first_name', 'last_name', 'email', 'role', 'is_active'],
    });

    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    if (user.is_active !== 1) {
      return res.status(401).json({ message: 'Account is not active' });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

// Optional auth middleware - allows both authenticated and guest users
export const optionalAuth = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      // No token provided, continue as guest user
      req.user = null;
      return next();
    }

    // Handle admin token format: "id|jwt_token"
    let jwtToken: string;
    if (token.includes('|')) {
      const parts = token.split('|');
      if (parts.length < 2 || !parts[1]) {
        // Invalid token format, continue as guest user
        req.user = null;
        return next();
      }
      jwtToken = parts[1];
    } else {
      jwtToken = token;
    }

    const decoded = jwt.verify(jwtToken, 'fallback-secret') as any;
    
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'first_name', 'last_name', 'email', 'role', 'is_active'],
    });

    if (!user) {
      // Invalid token, continue as guest user
      req.user = null;
      return next();
    }

    if (user.is_active !== 1) {
      // Inactive account, continue as guest user
      req.user = null;
      return next();
    }

    req.user = user;
    return next();
  } catch (error) {
    // Token error, continue as guest user
    req.user = null;
    return next();
  }
};

export const adminAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Handle admin token format: "id|jwt_token"
    let jwtToken: string | undefined = token;
    if (token && token.includes('|')) {
      jwtToken = token.split('|')[1];
    }

    if (!jwtToken) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    const decoded = jwt.verify(jwtToken, 'fallback-secret') as any;
    
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'first_name', 'last_name', 'email', 'role', 'is_active'],
    });

    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    if (user.is_active !== 1) {
      return res.status(401).json({ message: 'Account is not active' });
    }

    // Check if user is admin
    if (user.role !== 'admin' && user.role !== 'ADMIN' && user.role !== 'engineer' && user.role !== 'ENGINEER') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

export const engineerAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await new Promise<void>((resolve, reject) => {
      auth(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    if (!['ADMIN', 'ENGINEER'].includes(req.user?.role)) {
      return res.status(403).json({ message: 'Access denied. Engineer or Admin only.' });
    }
    
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed' });
  }
}; 