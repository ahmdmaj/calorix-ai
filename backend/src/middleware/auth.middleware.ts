import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend the Express Request interface
export interface AuthRequest extends Request {
  userId?: string;
}

interface JwtPayload {
  userId: string;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ status: 'error', message: 'Unauthorized: No token provided' });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-for-development';
    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ status: 'error', message: 'Unauthorized: Invalid token' });
  }
};
